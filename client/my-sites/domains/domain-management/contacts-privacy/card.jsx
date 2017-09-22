/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ContactDisplay from './contact-display';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import SectionHeader from 'components/section-header';
import support from 'lib/url/support';
import paths from 'my-sites/domains/paths';

class ContactsPrivacyCard extends React.PureComponent {
	static propTypes = {
		contactInformation: PropTypes.object.isRequired,
		privateDomain: PropTypes.bool.isRequired,
		hasPrivacyProtection: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		currentUserCanManage: PropTypes.bool.isRequired
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
									a: <a href={ support.PUBLIC_VS_PRIVATE }
										target="_blank" rel="noopener noreferrer"
									/>
								}
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
			translate
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
								strong: <strong />
							}
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
								a: <a href={
									paths.domainManagementTransferOut(
										selectedSite.slug,
										selectedDomainName
									) }
								/>
							}
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
							a: <a href={
								paths.domainManagementPrivacyProtection(
									selectedSite.slug,
									selectedDomainName
								) }
							/>
						}
					}
				) }
			</Notice>
		);
	}
}

export default localize( ContactsPrivacyCard );
