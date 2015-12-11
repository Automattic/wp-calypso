/**
 * External dependencies
 */
const React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
const analyticsMixin = require( 'lib/mixins/analytics' ),
	paths = require( 'my-sites/upgrades/paths' ),
	Button = require( 'components/button' );

const PrimaryDomainButton = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	propTypes: {
		domain: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		settingPrimaryDomain: React.PropTypes.bool.isRequired
	},

	handleClick() {
		this.recordEvent( 'makePrimaryClick', this.props.domain );

		page( paths.domainManagementPrimaryDomain( this.props.selectedSite.slug, this.props.domain.name ) );
	},

	render() {
		const domain = this.props.domain;
		var label;

		if ( domain && ! domain.isPrimary ) {
			if ( this.props.settingPrimaryDomain ) {
				label = this.translate( 'Saving…' );
			} else {
				label = this.translate( 'Make Primary' );
			}

			return (
				<Button
					compact
					className="domain-details-card__make-primary-button"
					onClick={ this.handleClick }>
					{ label }
				</Button>
			);
		}

		return null;
	}
} );

module.exports = PrimaryDomainButton;
