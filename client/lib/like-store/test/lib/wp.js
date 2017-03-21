/**
 * Stub wp module to avoid its dependency on the browser
 **/

function returnSelf() {
	return this;
}

export default {
	site: returnSelf,
	post: returnSelf,
	likesList: returnSelf
};
