import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { ASCIIBloomShader } from './ASCIIBloomShader';

class ASCIIBloomPass extends Pass {

	constructor() {

		super();

		// if ( FilmShader === undefined ) console.error( 'THREE.FilmPass relies on FilmShader' );

		const shader = ASCIIBloomShader;

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		// if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
		// if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
		// if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
		// if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

		this.fsQuad = new FullScreenQuad( this.material );

	}

	render( renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
        // if (Math.random() > 0.99) { this.uniforms.time.value += deltaTime }
        this.uniforms.time.value += deltaTime 

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

}

export { ASCIIBloomPass };