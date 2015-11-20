var ServicesList = require( './list' ),
	_services;

module.exports = function() {
	if ( ! _services ) {
		_services = new ServicesList();
	}

	return _services;
};
