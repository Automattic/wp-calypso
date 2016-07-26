/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ContactDisplay from './contact-display';
import Notice from 'components/notice';
import paths from 'my-sites/upgrades/paths';
import SectionHeader from 'components/section-header';
import support from 'lib/url/support';

const ContactsPrivacyCard = React.createClass( {
	propTypes: {
		contactInformation: React.PropTypes.object.isRequired,
		privateDomain: React.PropTypes.bool.isRequired,
		hasPrivacyProtection: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		currentUserCanManage: React.PropTypes.bool.isRequired
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
									a: <a href={ support.PUBLIC_VS_PRIVATE } target="_blank" />
								}
							}
						) }
					</p>

					{ this.props.currentUserCanManage && this.getNotice() }

					<ContactDisplay
						contactInformation={ this.props.contactInformation } />
				</CompactCard>
			</div>
		);
	},

	getNotice() {
		if ( this.props.hasPrivacyProtection && this.props.privateDomain ) {
			return (
				<Notice status="is-success" showDismiss={ false }>
					{ this.translate(
						'{{strong}}Privacy Protection{{/strong}} is turned on for this domain. ' +
						'Your contact information is {{strong}}private{{/strong}}. ',
						{
							components: {
								strong: <strong />
							}
						}
					) }
				</Notice>
			);
		} else if ( this.props.hasPrivacyProtection && ! this.props.privateDomain ) {
			return (
				<Notice status="is-warning" showDismiss={ false }>
					{ this.translate(
						'{{strong}}Privacy Protection{{/strong}} is temporarily ' +
						'disabled for this domain while the domain is being transferred. ' +
						'Your contact information is {{strong}}public{{/strong}}. ' +
						'{{a}}Cancel Transfer and Enable Privacy Protection{{/a}}',
						{
							components: {
								strong: <strong />,
								a: <a href={ paths.domainManagementTransfer( this.props.selectedSite.slug, this.props.selectedDomainName ) } />
							}
						}
					) }
				</Notice>
			);
		}

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ this.translate(
					'{{strong}}Privacy Protection{{/strong}} is turned off for this domain. ' +
					'Your contact information is {{strong}}public{{/strong}}. ' +
					'{{a}}Enable Privacy Protection{{/a}}',
					{
						components: {
							strong: <strong />,
							a: <a
								href={ paths.domainManagementPrivacyProtection(
									this.props.selectedSite.slug, this.props.selectedDomainName ) } />
						}
					}
				) }
			</Notice>
		);
	}
} );

module.exports = ContactsPrivacyCard;
