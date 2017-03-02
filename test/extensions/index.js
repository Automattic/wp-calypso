// TODO: This solution is temporary until issue #12203 is resolved:
// https://github.com/Automattic/wp-calypso/issues/12203

module.exports = {
	reducers: function() {
		return {
			helloDolly: require( 'extensions/hello-dolly/state/reducer' )
		};
	}
};
