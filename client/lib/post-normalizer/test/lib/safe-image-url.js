/** @format */
/**
 * A stub that makes safe-image-url deterministic
 */
var returnValue;

function makeSafe( url ) {
	return returnValue !== undefined ? returnValue : url + '-SAFE';
}

makeSafe.setReturns = function( val ) {
	returnValue = val;
};

makeSafe.undoReturns = function() {
	returnValue = undefined;
};

module.exports = makeSafe;
