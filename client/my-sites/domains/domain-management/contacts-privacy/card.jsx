/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ContactDisplay from './contact-display';
import Notice from 'components/notice';
import {
	domainManagementPrivacyProtection,
	domainManagementTransferOut,
} from 'my-sites/domains/paths';
import SectionHeader from 'components/section-header';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';

class ContactsPrivacyCard extends React.PureComponent {
	static propTypes = {
		contactInformation: PropTypes.object.isRequired,
		privateDomain: PropTypes.bool.isRequired,
		hasPrivacyProtection: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		currentUserCanManage: PropTypes.bool.isRequired,
	};

	render() {
		const { contactInformation, currentUserCanManage, translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy-card">
					<p className="settings-explanation">
						{ translate(
							'Domain owners are required to provide correct contact information. ' +
								'{{a}}Learn more{{/a}} about private registration and GDPR protection.',
							{
								components: {
									a: <a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer" />,
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
										href={ domainManagementTransferOut( selectedSite.slug, selectedDomainName ) }
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
									href={ domainManagementPrivacyProtection(
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
