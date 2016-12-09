/**
 * Stub wp module to avoid its dependency on the browser
 **/

function returnSelf() {
	return this;
}

module.exports = {
	site: returnSelf,
	post: returnSelf,
	undocumented: returnSelf,
	readFeedPost: returnSelf,
	batch: function() {
		return {
			add: returnSelf,
			run: returnSelf
		};
	},
	me: returnSelf,
	dismissSite: returnSelf
};
