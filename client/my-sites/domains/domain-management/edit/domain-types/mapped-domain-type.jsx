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
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import VerticalNavItem from 'components/vertical-nav/item';
import { emailManagement } from 'my-sites/email/paths';
import {
	domainManagementDns,
	domainManagementDomainConnectMapping,
	domainTransferIn,
} from 'my-sites/domains/paths';
import { isExpiringSoon } from 'lib/domains/utils';
import SubscriptionSettings from '../card/subscription-settings';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import { WPCOM_DEFAULTS } from 'lib/domains/nameservers';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { isSubdomain } from 'lib/domains';
import { DOMAIN_HELPER_PREFIX, MAP_SUBDOMAIN } from 'lib/url/support';

class MappedDomainType extends React.Component {
	getVerticalNavigation() {
		return (
			<VerticalNav>
				{ this.emailNavItem() }
				{ this.dnsRecordsNavItem() }
				{ this.domainConnectMappingNavItem() }
				{ this.transferMappedDomainNavItem() }
			</VerticalNav>
		);
	}

	emailNavItem() {
		const path = emailManagement( this.props.selectedSite.slug, this.props.domain.name );

		return <VerticalNavItem path={ path }>{ this.props.translate( 'Email' ) }</VerticalNavItem>;
	}

	dnsRecordsNavItem() {
		const path = domainManagementDns( this.props.selectedSite.slug, this.props.domain.name );

		return (
			<VerticalNavItem path={ path }>{ this.props.translate( 'DNS Records' ) }</VerticalNavItem>
		);
	}

	domainConnectMappingNavItem() {
		const { supportsDomainConnect, hasWpcomNameservers, pointsToWpcom } = this.props.domain;
		if ( ! supportsDomainConnect || hasWpcomNameservers || pointsToWpcom ) {
			return;
		}

		const path = domainManagementDomainConnectMapping(
			this.props.selectedSite.slug,
			this.props.domain.name
		);

		return (
			<VerticalNavItem path={ path }>
				{ this.props.translate( 'Connect Your Domain' ) }
			</VerticalNavItem>
		);
	}

	transferMappedDomainNavItem() {
		const { domain, selectedSite, translate } = this.props;

		if ( domain.expired || domain.isSubdomain || ! domain.isEligibleForInboundTransfer ) {
			return null;
		}

		const path = domainTransferIn( selectedSite.slug, domain.name, true );

		return (
			<VerticalNavItem path={ path }>
				{ translate( 'Transfer Domain to WordPress.com' ) }
			</VerticalNavItem>
		);
	}

	resolveStatus() {
		const { domain, translate, moment } = this.props;
		const { expiry } = domain;

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

		if ( ! domain.pointsToWpcom ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
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

		if ( ! isExpiringSoon( domain, 30 ) ) {
			return null;
		}

		return (
			<div>
				{ translate(
					'Your domain mapping will expire in {{strong}}%(days)s{{/strong}}. Please renew it before it expires or it will stop working.',
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

	renderSettingUpNameservers() {
		const { domain, selectedSite, translate } = this.props;
		if (
			selectedSite.jetpack ||
			( selectedSite.options && selectedSite.options.is_automated_transfer )
		) {
			return null;
		}

		if ( domain.pointsToWpcom ) {
			return null;
		}

		let primaryMessage;
		let learnMoreLink;

		if ( isSubdomain( domain.name ) ) {
			learnMoreLink = <a href={ MAP_SUBDOMAIN } target="_blank" rel="noopener noreferrer" />;
			primaryMessage = translate(
				'Your domain mapping has not been setup. You need to create the correct CNAME or NS records at your current DNS provider. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
				{
					components: { strong: <strong />, learnMoreLink },
					args: { domainName: domain.name },
					context: 'Notice for mapped subdomain that has DNS records need to set up',
				}
			);
		} else {
			learnMoreLink = (
				<a href={ DOMAIN_HELPER_PREFIX + domain.name } target="_blank" rel="noopener noreferrer" />
			);
			primaryMessage = translate(
				'Your domain mapping has not been setup. You need to update your nameservers, at the company you purchased your domain, to:',
				{
					args: { domainName: domain.name },
					context: 'Notice for mapped domain notice with NS records pointing to somewhere else',
				}
			);
		}
		const secondaryMessage = translate(
			"Please note that it can take up to 72 hours for your changes to become available. If you're still not seeing your site loading at %(domainName)s, please wait a few more hours, clear your browser cache, and try again.",
			{
				components: { learnMoreLink },
				args: { domainName: domain.name },
			}
		);

		return (
			<React.Fragment>
				<div>
					<p>{ primaryMessage }</p>
					{ ! isSubdomain( domain.name ) && (
						<ul>
							{ WPCOM_DEFAULTS.map( nameServer => {
								return <li>{ nameServer }</li>;
							} ) }
						</ul>
					) }
				</div>
				<div>{ secondaryMessage }</div>
			</React.Fragment>
		);
	}

	renderAutoRenew() {
		return (
			<Card compact={ true }>
				Auto Renew (on) <CompactFormToggle checked={ true } />
			</Card>
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
				<DomainStatus
					header={ domain_name }
					statusText={ statusText }
					statusClass={ statusClass }
					icon={ icon }
				>
					{ this.renderSettingUpNameservers() }
					{ this.renderExpiringSoon() }
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

export default connect( null, {
	recordPaymentSettingsClick,
} )( withLocalizedMoment( localize( MappedDomainType ) ) );
