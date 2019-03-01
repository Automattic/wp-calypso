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
import SectionHeader from 'components/section-header';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';

class ContactsPrivacyCard extends React.PureComponent {
	static propTypes = {
		contactInformation: PropTypes.object.isRequired,
		privateDomain: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		const { contactInformation, privateDomain, translate } = this.props;
		let privacyText = translate(
			'{{strong}}Privacy Protection is enabled{{/strong}} so your contact information' +
				' {{strong}}is not shown{{/strong}}.',
			{
				components: {
					strong: <strong />,
				},
			}
		);
		if ( ! privateDomain ) {
			privacyText = translate(
				'{{strong}}Privacy Protection is disabled{{/strong}} so your own contact information' +
					' {{strong}}is shown{{/strong}}.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy__card">
					<p>{ privacyText }</p>
					<ContactDisplay contactInformation={ contactInformation } />
					<p className="contacts-privacy__settings-explanation">
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
				</CompactCard>
			</div>
		);
	}
}

export default localize( ContactsPrivacyCard );
