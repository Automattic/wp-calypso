'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * Unlike most other architectures, on x86/x86-64 when floating-point instructions
 * have no NaN arguments, but produce NaN output, the output NaN has sign bit set.
 * We use it to distinguish x86/x86-64 from other architectures, by doing subtraction
 * of two infinities (must produce NaN per IEEE 754 standard).
 *
 * See https://codebrowser.bddppq.com/pytorch/pytorch/third_party/XNNPACK/src/init.c.html#79
 */
function getArchitecture() {
	var f = new Float32Array( 1 );
	var u8 = new Uint8Array( f.buffer );
	f[ 0 ] = Infinity;
	f[ 0 ] = f[ 0 ] - f[ 0 ];
	return u8[ 3 ];
}
exports.default = getArchitecture;
