/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SiteCreationStep = require( 'signup/steps/site' );

module.exports = React.createClass( {
	displayName: 'MlbDomainsStep',

	getDefaultProps: function() {
		return {
			domain: '.mlblogs.com'
		};
	},

	render: function() {
		return (
			<SiteCreationStep {...this.props }/>
		);
	}
} );
