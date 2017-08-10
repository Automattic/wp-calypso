/** @format */
/**
 * Stub wp module to avoid its dependency on the browser
 **/

function returnSelf() {
	return this;
}

module.exports = {
	site: returnSelf,
	post: returnSelf,
	likesList: returnSelf,
};
