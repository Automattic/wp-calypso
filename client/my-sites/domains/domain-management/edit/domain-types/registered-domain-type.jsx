/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { Card } from '@automattic/components';
import VerticalNav from 'components/vertical-nav';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import VerticalNavItem from 'components/vertical-nav/item';
import { emailManagement } from 'my-sites/email/paths';
import {
	domainManagementContactsPrivacy,
	domainManagementNameServers,
	domainManagementTransfer,
} from 'my-sites/domains/paths';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification';
import { isRecentlyRegistered, isExpiringSoon } from 'lib/domains/utils';
import { DOMAINS, SETTING_PRIMARY_DOMAIN } from 'lib/url/support';
import SubscriptionSettings from '../card/subscription-settings';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';

import CompactFormToggle from 'components/forms/form-toggle/compact';
import { Banner } from 'components/banner';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'state/current-user/constants';

class RegisteredDomainType extends React.Component {
	getVerticalNavigation() {
		const { expiry, expired, pendingTransfer } = this.props.domain;
		const { moment } = this.props;
		const inNormalState = ! pendingTransfer && ! expired;
		const inGracePeriod = moment().subtract( 18, 'days' ) <= moment( expiry );

		return (
			<VerticalNav>
				{ inNormalState && this.emailNavItem() }
				{ ( inNormalState || inGracePeriod ) && this.nameServersNavItem() }
				{ ( inNormalState || inGracePeriod ) && this.contactsPrivacyNavItem() }
				{ ( ! expired || inGracePeriod ) && this.transferNavItem() }
			</VerticalNav>
		);
	}

	emailNavItem() {
		const path = emailManagement( this.props.selectedSite.slug, this.props.domain.name );

		return <VerticalNavItem path={ path }>{ this.props.translate( 'Email' ) }</VerticalNavItem>;
	}

	nameServersNavItem() {
		const path = domainManagementNameServers(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.props.translate( 'Name Servers and DNS' ) }
			</VerticalNavItem>
		);
	}

	contactsPrivacyNavItem() {
		const { translate } = this.props;
		const path = domainManagementContactsPrivacy(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return <VerticalNavItem path={ path }>{ translate( 'Contacts and Privacy' ) }</VerticalNavItem>;
	}

	transferNavItem() {
		const path = domainManagementTransfer( this.props.selectedSite.slug, this.props.domain.name );

		return (
			<VerticalNavItem path={ path }>{ this.props.translate( 'Transfer Domain' ) }</VerticalNavItem>
		);
	}

	resolveStatus() {
		const { domain, translate, moment } = this.props;
		const { registrationDate, expiry } = domain;

		if ( isExpiringSoon( domain, 30 ) ) {
			const expiresMessage = translate( 'Expires in %(days)s', {
				args: { days: moment.utc( expiry ).fromNow( true ) },
			} );

			if ( isExpiringSoon( domain, 5 ) ) {
				return {
					statusText: expiresMessage,
					statusClass: 'status-error',
					icon: 'info',
				};
			}

			return {
				statusText: expiresMessage,
				statusClass: 'status-warning',
				icon: 'info',
			};
		}

		if ( domain.isPendingIcannVerification && domain.currentUserCanManage ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		if ( domain.expired ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		const recentlyRegistered = isRecentlyRegistered( registrationDate );

		if ( recentlyRegistered ) {
			return {
				statusText: translate( 'Activating' ),
				statusClass: 'status-pending',
				icon: 'cloud_upload',
			};
		}

		return {
			statusText: translate( 'Active' ),
			statusClass: 'status-success',
			icon: 'check_circle',
		};
	}

	renderExpiringSoon() {
		const { domain, translate, moment } = this.props;
		const { expiry } = domain;

		if ( isExpiringSoon( domain, 30 ) ) {
			return (
				<div>
					{ translate(
						'Your domain will expire in {{strong}}%(days)s{{/strong}}. Please renew it before it expires or it will stop working.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								days: moment.utc( expiry ).fromNow( true ),
							},
						}
					) }
				</div>
			);
		}

		return null;
	}

	renderExpired() {
		const { domain, translate, moment } = this.props;
		const domainsLink = <a href={ DOMAINS } target="_blank" rel="noopener noreferrer" />;

		if ( ! domain.expired ) {
			return null;
		}

		let message;

		if ( domain.isRenewable ) {
			message = translate(
				'Your domain has expired and is no longer active. You have {{strong}}%(days)s{{/strong}} to renew it at the standard rate before an additional redemption fee is applied. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						domainsLink,
						strong: <strong />,
					},
					args: {
						days: moment.utc( domain.renewableUntil ).fromNow( true ),
					},
				}
			);
		} else if ( domain.isRedeemable ) {
			message = translate(
				'Your domain has expired and is no longer active. You have {{strong}}%(days)s{{/strong}} to reactivate it during this redemption period before someone else can register it. A additional redemption fee will be added to the price of the domain to reactivate it. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						domainsLink,
						strong: <strong />,
					},
					args: {
						days: moment.utc( domain.redeemableUntil ).fromNow( true ),
					},
				}
			);
		} else {
			message = translate(
				'Your domain has expired and is no longer active. {{domainsLink}}Learn more{{/domainsLink}}',
				{
					components: {
						domainsLink,
					},
				}
			);
		}

		return <div>{ message }</div>;
	}

	renderRecentlyRegistered() {
		const { domain, translate } = this.props;
		const { registrationDate, name: domain_name } = domain;
		const domainsLink = <a href={ DOMAINS } target="_blank" rel="noopener noreferrer" />;

		const recentlyRegistered = isRecentlyRegistered( registrationDate );

		if ( ! recentlyRegistered ) {
			return null;
		}

		return (
			<div>
				{ translate(
					'We are setting up {{strong}}%(domain)s{{/strong}} for you. It should start working immediately but may be unreliable in the first 30 minutes. {{domainsLink}}Learn more{{/domainsLink}}',
					{
						args: {
							domain: domain_name,
						},
						components: {
							domainsLink,
							strong: <strong />,
						},
					}
				) }
			</div>
		);
	}

	renderAutoRenew() {
		return (
			<Card compact={ true }>
				Auto Renew (on) <CompactFormToggle checked={ true } />
			</Card>
		);
	}

	planUpsellForNonPrimaryDomain() {
		const { domain, hasNonPrimaryDomainsFlag, isDomainOnly, selectedSite, translate } = this.props;

		if (
			! hasNonPrimaryDomainsFlag ||
			isDomainOnly ||
			! domain.pointsToWpcom ||
			domain.isPrimary ||
			domain.isWPCOMDomain ||
			domain.isWpcomStagingDomain
		) {
			return null;
		}

		return (
			<Banner
				title={ translate( 'This domain is being forwarded to %(primaryDomain)s', {
					args: {
						primaryDomain: selectedSite.slug,
					},
				} ) }
				description={ translate(
					'Upgrade to a paid plan to make {{strong}}%(domain)s{{/strong}} the primary address that your visitors see when they visit your site. {{a}}Learn more{{/a}}',
					{
						args: {
							domain: domain.name,
						},
						components: {
							a: <a href={ SETTING_PRIMARY_DOMAIN } target="_blank" rel="noopener noreferrer" />,
							strong: <strong />,
						},
					}
				) }
				callToAction={ translate( 'Upgrade' ) }
				tracksImpressionName="calypso_non_primary_domain_settings_plan_upsell_impression"
				tracksClickName="calypso_non_primary_domain_settings_plan_upsell_click"
				event="calypso_non_primary_domain_settings_plan_upsell"
			/>
		);
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, moment } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = this.resolveStatus();

		const newStatusDesignAutoRenew = config.isEnabled( 'domains/new-status-design/auto-renew' );

		return (
			<div className="domain-types__container">
				{ this.planUpsellForNonPrimaryDomain() }
				<DomainStatus
					header={ domain_name }
					statusText={ statusText }
					statusClass={ statusClass }
					icon={ icon }
				>
					{ domain.isPendingIcannVerification && domain.currentUserCanManage && (
						<IcannVerificationCard
							selectedDomainName={ domain.name }
							selectedSiteSlug={ this.props.selectedSite.slug }
							explanationContext="new-status"
							compact={ true }
						/>
					) }
					{ this.renderExpiringSoon() }
					{ this.renderExpired() }
					{ this.renderRecentlyRegistered() }
				</DomainStatus>
				<Card compact={ true } className="domain-types__expiration-row">
					<div>
						{ domain.expired
							? this.props.translate( 'Expired: %(expiry_date)s', {
									args: {
										expiry_date: moment( domain.expiry ).format( 'LL' ),
									},
							  } )
							: this.props.translate( 'Expires: %(expiry_date)s', {
									args: {
										expiry_date: moment( domain.expiry ).format( 'LL' ),
									},
							  } ) }
					</div>
					{ ! newStatusDesignAutoRenew && (
						<div>
							<SubscriptionSettings
								type={ domain.type }
								compact={ true }
								subscriptionId={ domain.subscriptionId }
								siteSlug={ this.props.selectedSite.slug }
								onClick={ this.handlePaymentSettingsClick }
							/>
						</div>
					) }
				</Card>
				{ newStatusDesignAutoRenew && this.renderAutoRenew() }
				{ this.getVerticalNavigation() }
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
	};
};

export default connect( mapStateToProps, {
	recordTracksEvent,
	recordGoogleEvent,
	recordPaymentSettingsClick,
} )( withLocalizedMoment( localize( RegisteredDomainType ) ) );
