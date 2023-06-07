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

 const ASCIIBloomShader = {

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

        

        void main() {
            vec4 previousPassColor = texture2D(tDiffuse, vUv);
            vec3 previousColor = previousPassColor.rgb;
            float gray = clamp(
                0.33 * previousColor.r + 0.33 * previousColor.g + 0.33 * previousColor.b,
                0.0,
                1.0
            );

            vec3 col;

            if (gray > 0.0) {
                col = previousColor;
            } 
            else {
                vec2 pix = gl_FragCoord.xy;
                vec3 col_1 = texture2D(tDiffuse, floor(pix/1.0)*1.0/u_resolution.xy).rgb;
                vec3 col_2 = texture2D(tDiffuse, floor(pix/1.0)*1.0/u_resolution.xy).rgb;
                vec3 col_4 = texture2D(tDiffuse, floor(pix/1.0)*1.0/u_resolution.xy).rgb;
                col = col_1 + col_2 / 2.0 + col_4 /4.0;

                float localGray = clamp(
                    0.33 * col.r + 0.33 * col.g + 0.33 * col.b,
                    0.0,
                    1.0
                );

                col = col * localGray * 0.5;
                // col = vec3(0.5, 0.5, 0.5);
            }
            
            gl_FragColor = vec4(col, 1.0);

        }
    `

}

export { ASCIIBloomShader }
