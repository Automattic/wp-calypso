/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ContactDisplay from './contact-display';
import Button from 'components/button';
import Notice from 'components/notice';
import { domainManagementTransferOut } from 'my-sites/domains/paths';
import SectionHeader from 'components/section-header';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';
import {
	fetchWhois,
	disablePrivacyProtection,
	enablePrivacyProtection,
} from 'lib/upgrades/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { fetchSiteDomains } from 'state/sites/domains/actions';

class ContactsPrivacyCard extends React.Component {
	static propTypes = {
		contactInformation: PropTypes.object.isRequired,
		privateDomain: PropTypes.bool.isRequired,
		hasPrivacyProtection: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		currentUserCanManage: PropTypes.bool.isRequired,
	};

	state = {
		submitting: false,
	};

	render() {
		const { contactInformation, currentUserCanManage, translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy__card">
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

					{ currentUserCanManage && this.getStatus() }

					<ContactDisplay contactInformation={ contactInformation } />
				</CompactCard>
			</div>
		);
	}

	togglePrivacy = () => {
		const { privateDomain, selectedDomainName, selectedSite, translate } = this.props;

		this.setState( { submitting: true } );

		const callback = error => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.props.fetchSiteDomains( selectedSite.ID );
				fetchWhois( selectedDomainName );

				const notice = privateDomain
					? translate( 'Yay, privacy has been successfully disabled!' )
					: translate( 'Yay, privacy has been successfully enabled!' );

				this.props.successNotice( notice, {
					duration: 5000,
				} );
			}

			this.setState( { submitting: false } );
		};

		if ( privateDomain ) {
			disablePrivacyProtection( selectedDomainName, callback );
		} else {
			enablePrivacyProtection( selectedDomainName, callback );
		}
	};

	getStatus() {
		const {
			hasPrivacyProtection,
			privacyAvailable,
			privateDomain,
			selectedSite,
			selectedDomainName,
			translate,
		} = this.props;
		const { submitting } = this.state;

		if ( ! privacyAvailable ) {
			return false;
		}

		if ( hasPrivacyProtection && ! privateDomain ) {
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

		let privacyText = translate(
			'{{strong}}Privacy Protection{{/strong}} is turned {{strong}}off{{/strong}} for this domain. ' +
				'Your contact information is {{strong}}public{{/strong}}.',
			{
				components: {
					strong: <strong />,
				},
			}
		);

		if ( privateDomain ) {
			privacyText = translate(
				'{{strong}}Privacy Protection{{/strong}} is turned {{strong}}on{{/strong}} for this domain. ' +
					'Your contact information is {{strong}}private{{/strong}}. ',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<div className="contacts-privacy__info">
				<p>{ privacyText }</p>
				<Button
					className="contacts-privacy__info-button"
					disabled={ submitting }
					busy={ submitting }
					onClick={ this.togglePrivacy }
				>
					{ privateDomain ? translate( 'Disable Privacy' ) : translate( 'Enable Privacy' ) }
				</Button>
			</div>
		);
	}
}

export default connect(
	null,
	{
		fetchSiteDomains,
		errorNotice,
		successNotice,
	}
)( localize( ContactsPrivacyCard ) );
