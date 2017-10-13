/**
 * Stub wp module to avoid its dependency on the browser
 *
 * @format
 */

function returnSelf() {
	return this;
}

export default {
	site: returnSelf,
	post: returnSelf,
	undocumented: returnSelf,
	readFeedPost: returnSelf,
	batch: function() {
		return {
			add: returnSelf,
			run: returnSelf,
		};
	},
};
