/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var DomainSuggestion = require( 'components/domains/domain-suggestion' );

var DomainMappingSuggestion = React.createClass( {
	render: function() {
		var buttonLabel = this.translate( 'Map it', {
			context: 'Go to the flow to add a domain mapping'
		} );

		return (
			<DomainSuggestion
					price={ this.props.products.domain_map ? this.props.products.domain_map.cost_display : null }
					extraClasses="is-visible domain-mapping-suggestion"
					buttonClasses="map"
					buttonLabel={ buttonLabel }
					cart={ this.props.cart }
					isAdded={ false }
					onButtonClick={ this.props.onButtonClick }>
				<div className="domain-mapping-suggestion__domain-description">
					<h3>
						{ this.translate( 'Already own a domain?', {
							context: 'Upgrades: Register domain header',
							comment: 'Asks if you want to own a new domain (not if you want to map an existing domain).'
						} ) }
					</h3>
					<p>
						{ this.translate( 'Map this domain to use it as your site\'s address.', {
							context: 'Upgrades: Register domain description',
							comment: 'Explains how you could use a new domain name for your site\'s address.'
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
} );

module.exports = DomainMappingSuggestion;
