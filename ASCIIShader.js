/**
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

 import * as THREE from "three"

 const width = window.innerWidth;
 const height = window.innerHeight;
 
 const size = width * height;
 const data = new Uint8Array( 4 * size );
 // const data = new Uint8Array(size)
 const color = new THREE.Color( 0xaf4020 );
 
 const r = Math.floor( color.r * 255 );
 const g = Math.floor( color.g * 255 );
 const b = Math.floor( color.b * 255 );
 
 for ( let i = 0; i < size; i ++ ) {
 
     const random = Math.random() * 255
     const stride = i * 4;
 
     data[ stride ] = random;
     data[ stride + 1 ] = random;
     data[ stride + 2 ] = random;
     data[ stride + 3 ] = 1;
 
 }
 
 let texture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat )

 const ASCIIShader = {

	uniforms: {
        tDiffuse: { value: null },
        u_channel0: { value: texture },
        time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;


        uniform sampler2D u_channel0;
        uniform vec2 u_resolution;


        uniform float time;

        float rand(vec2 co){
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        // float rand(vec2 co) {
        //     return fract(sin(dot(co, vec2(1.0, 1.0))) * 43.0);
        // }


        float character(int n, vec2 p) {
            // 3.0 --> 4.0, 1.875 --> 2.5
            // p = floor(p * vec2(4, -4) + 2.5);
            // if (clamp(p.x, 0.0, 4.0) == p.x) {
            //     if (clamp(p.y, 0.0, 4.0) == p.y) {
            //         int a = int(round(p.x) + 5.0 * round(p.y));
            //         if (((n >> a) & 1) == 1) return 1.0;
            //     }	
            // }
            // int a = int(round(p.x) * round(p.y) );
            // p = mod(p, 6.0);
            // p = p + 0.75;
            int x = int(p.x) % 6;
            int y = int(p.y) % 6;

            if (x == 5) {
                return 0.0;
            }

            if (y == 5) {
                return 0.0;
            }

            // p = p * (6.0 / 5.0);

            int a = 25 - (5 - x + 5 * y);
            // int a = x + 5 * y;
            // int a = 36 - int((5.0 - p.x) + 5.0 * p.y);

            // int a = 25 - int((5.0 - p.x) + 5.0 * p.y);
            // int a = int(p.x + 6.0 * p.y);
            // int a = 25;
            // int a = x + 5 * y;
            if (((n >> a) & 1) == 1) return 1.0;
            return 0.0;
        }
        

        int choice(int n[10]) {
            vec2 pix = gl_FragCoord.xy;
            float cell_x = 6.0;
            float cell_y = 6.0;
            vec2 cell = floor(pix / vec2(cell_x, cell_y)) * vec2(cell_x, cell_y);
            float dx = rand( cell/u_resolution.xy );
            int index = int(dx * 10.0);
            return n[9];
            // return n[index];
        }



        int[10] getIntegerBitmapArray(float gray) {
            int integerBitmapArray[10];

            // pixel = 0
            if (gray < 0.059) {
                integerBitmapArray = int[](
                    0,          // SPACE           
                    0,          // SPACE 
                    0,          // SPACE 
                    0,          // SPACE 
                    0,          // SPACE 
                    0,          // SPACE 
                    0,          // SPACE 
                    0,          // SPACE 
                    0,          // SPACE 
                    0           // SPACE
                );
                return integerBitmapArray;
            }

            // pixel = 1
            if (gray < 0.118) {
                integerBitmapArray = int[](
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096,           // .
                    4096            // .
                );
                return integerBitmapArray;
            }
            
            // pixel = 2
            if (gray < 0.176) {
                integerBitmapArray = int[](
                    69632,          // ,
                    69632,          // ,
                    264,            // '
                    264,            // '
                    130,            // BACKTICK
                    130,            // BACKTICK
                    131200,         // :
                    131200,         // :
                    131200,         // :
                    131200          // :
                );
                return integerBitmapArray;
            }

            // pixel = 3
            if (gray < 0.235) {
                integerBitmapArray = int[](
                    324,            // ^
                    324,            // ^
                    324,            // ^
                    14336,          // -
                    14336,          // -
                    14336,          // -
                    131204,         // !
                    131204,         // !
                    2228352,        // ;
                    2228352         // ;
                );
                return integerBitmapArray;
            }

            // pixel = 4
            if (gray < 0.294) {
                integerBitmapArray = int[](
                    10560,          // "
                    10560,          // "
                    10560,          // "
                    10560,          // "
                    10560,          // "
                    4325508,        // BROKEN_BAR ¦
                    4325508,        // BROKEN_BAR ¦
                    4325508,        // BROKEN_BAR ¦
                    4325508,        // BROKEN_BAR ¦
                    4325508         // BROKEN_BAR ¦
                );
                return integerBitmapArray;
            }

            // pixel = 5
            if (gray < 0.353) {
                integerBitmapArray = int[](
                    32505856,       // _
                    32505856,       // _
                    317440,         // ~
                    317440,         // ~ 
                    4260932,        // <
                    4260932,        // <
                    4473092,        // >
                    4473092,        // >
                    4261956,        // (
                    4464900         // )
                );
                return integerBitmapArray;
            }

            // pixel = 6
            if (gray < 0.412) {
                integerBitmapArray = int[](
                    9507104,        // %
                    9507104,        // % 
                    9507104,        // %
                    9507104,        // %
                    9507104,        // %
                    4198694,        // ?
                    4198694,        // ?
                    4198694,        // ?
                    4198694,        // ?
                    4198694         // ?
                );
                return integerBitmapArray;
            }

            // pixel = 7
            if (gray < 0.471) {
                integerBitmapArray = int[](
                    4329809,        // Y
                    4329809,        // Y
                    4329809,        // Y
                    4226052,        // DIVIDE_SYMBOL ÷
                    4226052,        // DIVIDE_SYMBOL ÷
                    4226052,        // DIVIDE_SYMBOL ÷
                    6359110,        // [
                    6359110,        // [ 
                    12853516,       // ]
                    12853516        // ]
                );
                return integerBitmapArray;
            }

            // pixel = 8
            if (gray < 0.529) {
                integerBitmapArray = int[](
                    15762465,       // L
                    15762465,       // L
                    15762465,       // L
                    15762465,       // L
                    14684612,       // PLUS_MINUS ±
                    14684612,       // PLUS_MINUS ±
                    12720268,       // {
                    6360134,        // }
                    2306832,        // FORWARD SLASH /
                    8788065         // BACKSLASH
                );
                return integerBitmapArray;
            }

            // pixel = 9
            if (gray < 0.588) {
                integerBitmapArray = int[](
                    4329631,        // T
                    4329631,        // T 
                    4539953,        // V
                    18157905,       // X
                    4334111,        // 7
                    4334111,        // 7
                    4357252,        // +
                    4357252,        // +
                    332772,         // *
                    332772          // *
                );
                return integerBitmapArray;
            }

            // pixel = 10
            if (gray < 0.647) {
                integerBitmapArray = int[](
                    32641220,       // 1
                    32641220,       // 1
                    32641220,       // 1
                    32641220,       // 1
                    32641220,       // 1
                    1016800,        // =
                    1016800,        // =
                    1016800,        // =
                    1016800,        // =
                    1016800         // =
                );
                return integerBitmapArray;
            }

            // pixel = 11
            if (gray < 0.706) {
                integerBitmapArray = int[](
                    23385164,       // &
                    23385164,       // &
                    15238702,       // C
                    15238702,       // C 
                    18128177,       // K
                    18128177,       // K
                    15255089,       // U
                    15255089,       // U
                    9415048,        // 4
                    9415048         // 4
                );
                return integerBitmapArray;
            }

            // pixel = 12
            if (gray < 0.765) {
                integerBitmapArray = int[](
                    15255086,       // O
                    15255086,       // O
                    15255086,       // O
                    15255086,       // O
                    1096767,        // F
                    1096767,        // F 
                    6595871,        // J
                    6595871,        // J
                    1097263,        // P
                    1097263         // P
                );
                return integerBitmapArray;
            }

            // pixel = 13
            if (gray < 0.824) {
                integerBitmapArray = int[](
                    18415153,       // H
                    32641183,       // I 
                    18405233,       // M
                    18667121,       // N
                    23385646,       // Q
                    16267326,       // S
                    18732593,       // W
                    32575775,       // Z
                    32584238,       // 2
                    15252014        // 8
                );
                return integerBitmapArray;
            }

            // pixel = 14
            if (gray < 0.882) {
                integerBitmapArray = int[](
                    18415150,       // A
                    18415150,       // A
                    16303663,       // D
                    16303663,       // D
                    15266878,       // G
                    15266878,       // G
                    18398767,       // R
                    18398767,       // R 
                    16284175,       // 3
                    16284175        // 3
                );
                return integerBitmapArray;
            }

            // pixel = 15
            if (gray < 0.941) {
                integerBitmapArray = int[](
                    15324974,       // 0
                    15324974,       // 0
                    16268351,       // 5
                    16268351,       // 5
                    15268926,       // 6
                    15268926,       // 6
                    16285230,       // 9
                    16285230,       // 9
                    16398526,       // $
                    16398526        // $
                );
                return integerBitmapArray;
            }

            // pixel = 16
            else { 
                integerBitmapArray = int[](
                    16301615,       // B
                    16301615,       // B
                    16301615,       // B
                    32554047,       // E 
                    32554047,       // E
                    32554047,       // E
                    11512810,       // #
                    11512810,       // #
                    11512810,       // #
                    11512810        // #
                );
                return integerBitmapArray;
            }
        }

        

        void main() {
            vec4 previousPassColor = texture2D(tDiffuse, vUv);

            int row = int(gl_FragCoord.y/8.0) % 2;
            int column = int(gl_FragCoord.x/8.0) % 2;

            vec2 pix = gl_FragCoord.xy;
            // 8.0
            // vec3 col = texture2D(tDiffuse, floor(pix/4.0)*4.0/u_resolution.xy).rgb;	

            float cell_x = 6.0;
            float cell_y = 6.0;
            // vec2 cell = floor(pix / vec2(cell_x, cell_y)) * vec2(cell_x, cell_y);
            vec2 cell = vec2(
                floor(pix.x/cell_x) * cell_x,
                floor(pix.y/cell_y) * cell_y
            );
            // vec3 col = texture2D(tDiffuse, cell/u_resolution.xy).rgb;
            vec3 col = texture2D(tDiffuse, cell/u_resolution.xy).rgb;

            

            // float dx = rand( floor(pix/4.0)*4.0/u_resolution.xy + time * 0.0 );
            float dx = rand( cell/u_resolution.xy + time * 0.0 );

            float grad = 5.0;
            float maxRand = 0.044;
            // float maxRand = 0.25;
            float den = 1.0 / (maxRand * 2.0);
            float x = dx * grad - log(den) - grad / 2.0;
            float random = 1.0 / (den + exp(-x)) - maxRand;
            // float random = 1.0 / (den + exp(-x));

            // include controls in uniforms for color balance and blending
            float gray = clamp(
                0.33 * col.r + 0.33 * col.g + 0.33 * col.b + random * 1.0,
                0.0,
                1.0
            );

            
            
            // add bitmap explanation :)

            // 4.0
            // vec2 p = mod(pix/2.5, 2.0) - vec2(1.0);
            // vec2 p = mod(pix, 5.0);


            int integerBitmap = choice(getIntegerBitmapArray(gray));

            // vec3 noise = rand( vUv + time ) * previousPassColor.rgb * gray * 0.0;
            
            col = col * character(integerBitmap, pix) + col * 0.0;

            
            // col = col + vec3(noise, noise, noise);

            
            gl_FragColor = vec4(col, 1.0);

        }
    `

}

export { ASCIIShader }
