/**
 * External dependencies
 */
var React = require( 'react/addons' );

var Card = require( 'components/card' );
var SiteIcon = require( 'components/site-icon' );

module.exports = React.createClass( {

	displayName: 'SubscriptionPlaceholder',

	render: function() {
		return (
			<Card className="is-compact reader-list-item__card is-placeholder">
				<span className="reader-list-item__icon">
					<SiteIcon size={ 48 } />
				</span>

				<h2 className="reader-list-item__title"><span className="placeholder-text">Subscription title</span></h2>
				<p className="reader-list-item__description"><span className="placeholder-text">Subscription URL</span></p>
			</Card>
			);
	}
} );
