/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'SharingServicePlaceholder',

	render: function() {
		return (
			<li className="sharing-service is-placeholder">
				<header className="sharing-service__overview">
					<span className="sharing-service__content-toggle noticon noticon-expand" />
					<div className="sharing-service__icon" />
					<h3 className="sharing-service__name" />
					<p className="sharing-service__description" />
					<a className="sharing-service-action button" disabled={ true }>{ this.translate( 'Loading…' ) }</a>
				</header>
			</li>
		);
	}
} );
