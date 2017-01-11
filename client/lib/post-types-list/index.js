var PostTypesList = require( './list' ),
	_postTypes;

module.exports = function() {
	if ( ! _postTypes ) {
		_postTypes = new PostTypesList();
	}

	return _postTypes;
};
