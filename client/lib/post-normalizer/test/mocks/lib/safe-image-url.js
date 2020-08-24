/**
 * A stub that makes safe-image-url deterministic
 *
 */

let returnValue;

function makeSafe( url ) {
	return returnValue !== undefined ? returnValue : url + '-SAFE';
}

makeSafe.setReturns = function ( val ) {
	returnValue = val;
};

makeSafe.undoReturns = function () {
	returnValue = undefined;
};

export default makeSafe;
