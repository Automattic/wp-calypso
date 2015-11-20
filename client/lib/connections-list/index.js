var ConnectionsList = require( './list' ),
	_connections;

module.exports = function() {
	if ( ! _connections ) {
		_connections = new ConnectionsList();
	}

	return _connections;
};
