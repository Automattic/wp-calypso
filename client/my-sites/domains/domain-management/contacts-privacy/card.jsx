/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ContactDisplay from './contact-display';
import Notice from 'components/notice';
import paths from 'my-sites/domains/paths';
import SectionHeader from 'components/section-header';
import support from 'lib/url/support';

class ContactsPrivacyCard extends React.PureComponent {
	static propTypes = {
		contactInformation: React.PropTypes.object.isRequired,
		privateDomain: React.PropTypes.bool.isRequired,
		hasPrivacyProtection: React.PropTypes.bool.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.bool ] )
			.isRequired,
		currentUserCanManage: React.PropTypes.bool.isRequired,
	};

	render() {
		const { contactInformation, currentUserCanManage, translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy-card">
					<p className="settings-explanation">
						{ translate(
							'Domain owners are required to make their contact information available to the public. ' +
								'{{a}}Learn more.{{/a}}',
							{
								components: {
									a: (
										<a
											href={ support.PUBLIC_VS_PRIVATE }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>

					{ currentUserCanManage && this.getNotice() }

					<ContactDisplay contactInformation={ contactInformation } />
				</CompactCard>
			</div>
		);
	}

	getNotice() {
		const {
			hasPrivacyProtection,
			privacyAvailable,
			privateDomain,
			selectedSite,
			selectedDomainName,
			translate,
		} = this.props;

		if ( ! privacyAvailable ) {
			return false;
		}

		if ( hasPrivacyProtection && privateDomain ) {
			return (
				<Notice status="is-success" showDismiss={ false }>
					{ translate(
						'{{strong}}Privacy Protection{{/strong}} is turned on for this domain. ' +
							'Your contact information is {{strong}}private{{/strong}}. ',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</Notice>
			);
		} else if ( hasPrivacyProtection && ! privateDomain ) {
			return (
				<Notice status="is-warning" showDismiss={ false }>
					{ translate(
						'{{strong}}Privacy Protection{{/strong}} is temporarily ' +
							'disabled for this domain while the domain is being transferred. ' +
							'Your contact information is {{strong}}public{{/strong}}. ' +
							'{{a}}Cancel Transfer and Enable Privacy Protection{{/a}}',
						{
							components: {
								strong: <strong />,
								a: (
									<a
										href={ paths.domainManagementTransferOut(
											selectedSite.slug,
											selectedDomainName
										) }
									/>
								),
							},
						}
					) }
				</Notice>
			);
		}

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					'{{strong}}Privacy Protection{{/strong}} is turned off for this domain. ' +
						'Your contact information is {{strong}}public{{/strong}}. ' +
						'{{a}}Enable Privacy Protection{{/a}}',
					{
						components: {
							strong: <strong />,
							a: (
								<a
									href={ paths.domainManagementPrivacyProtection(
										selectedSite.slug,
										selectedDomainName
									) }
								/>
							),
						},
					}
				) }
			</Notice>
		);
	}
}

export default localize( ContactsPrivacyCard );
