/**
 * External dependencies
 */
const React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
const CompactCard = require( 'components/card/compact' ),
	ContactDisplay = require( './contact-display' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	paths = require( 'my-sites/upgrades/paths' ),
	SectionHeader = require( 'components/section-header' );

const ContactsPrivacyCard = React.createClass( {
	propTypes: {
		contactInformation: React.PropTypes.object.isRequired,
		privacyProtectionEnabled: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy-card">
					<p className="settings-explanation">
						{ this.translate(
							'Domain owners are required to make their contact information available to the public. ' +
							'{{a}}Learn more.{{/a}}',
							{
								components: {
									a: <a href="https://support.wordpress.com/domains/register-domain/#public-versus-private" target="_blank" />
								}
							}
						) }
					</p>

					{ this.getNotice() }

					<ContactDisplay
						contactInformation={ this.props.contactInformation } />
				</CompactCard>
			</div>
		);
	},

	getNotice() {
		if ( this.props.privacyProtectionEnabled ) {
			return (
				<SimpleNotice status={ 'is-success' } showDismiss={ false }>
					{ this.translate(
						'{{strong1}}Privacy Protection{{/strong1}} is turned on for this domain. ' +
						'Your contact information is {{strong2}}private{{/strong2}}. ',
						{
							components: {
								strong1: <strong />,
								strong2: <strong />
							}
						}
					) }
				</SimpleNotice>
			);
		}

		return (
			<SimpleNotice status={ 'is-warning' } showDismiss={ false }>
				{ this.translate(
					'{{strong1}}Privacy Protection{{/strong1}} is turned off for this domain. ' +
					'Your contact information is {{strong2}}public{{/strong2}}. ' +
					'{{a}}Enable Privacy Protection{{/a}}',
					{
						components: {
							strong1: <strong />,
							strong2: <strong />,
							a: <a href="" onClick={ this.goToPrivacyProtection } />
						}
					}
				) }
			</SimpleNotice>
		);
	},

	goToPrivacyProtection( event ) {
		event.preventDefault();

		page( paths.domainManagementPrivacyProtection( this.props.selectedSite.domain, this.props.selectedDomainName ) );
	}
} );

module.exports = ContactsPrivacyCard;
