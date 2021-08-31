import { Button, CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import InfoPopover from 'calypso/components/info-popover';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Spinner from 'calypso/components/spinner';
import {
	canCurrentUserAddEmail,
	isDomainInGracePeriod,
	isDomainUpdateable,
	getDomainTypeText,
	resolveDomainStatus,
} from 'calypso/lib/domains';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs, getGSuiteMailboxCount } from 'calypso/lib/gsuite';
import { handleRenewNowClick } from 'calypso/lib/purchases';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import { withoutHttp } from 'calypso/lib/url';
import DomainNotice from 'calypso/my-sites/domains/domain-management/components/domain-notice';
import {
	domainManagementChangeSiteAddress,
	domainManagementContactsPrivacy,
	domainManagementNameServers,
	domainManagementTransfer,
	domainManagementDns,
	domainManagementSecurity,
} from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class DomainItem extends PureComponent {
	static propTypes = {
		busyMessage: PropTypes.string,
		currentRoute: PropTypes.string,
		disabled: PropTypes.bool,
		domain: PropTypes.object.isRequired,
		domainDetails: PropTypes.object,
		site: PropTypes.object,
		isManagingAllSites: PropTypes.bool,
		isBusy: PropTypes.bool,
		showCheckbox: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onMakePrimaryClick: PropTypes.func,
		onToggle: PropTypes.func,
		shouldUpgradeToMakePrimary: PropTypes.bool,
		purchase: PropTypes.object,
		isLoadingDomainDetails: PropTypes.bool,
		selectionIndex: PropTypes.number,
		isChecked: PropTypes.bool,
		showDomainDetails: PropTypes.bool,
		actionResult: PropTypes.object,
	};

	static defaultProps = {
		disabled: false,
		isManagingAllSites: false,
		showCheckbox: false,
		onToggle: null,
		isLoadingDomainDetails: false,
		isBusy: false,
		isChecked: false,
		showDomainDetails: true,
	};

	handleClick = () => {
		const { onClick, domainDetails, showCheckbox, domain, isChecked, onToggle } = this.props;

		onClick( domainDetails );
		showCheckbox && onToggle( domain.domain, ! isChecked );
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	onToggle = ( event ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( this.props.domain.domain, event.target.checked );
		}
	};

	addEmailClick = ( event ) => {
		const { trackAddEmailClick, currentRoute, disabled, domain, site } = this.props;
		event.stopPropagation();

		trackAddEmailClick( domain ); // analytics/tracks

		if ( disabled ) {
			return;
		}
		page( emailManagement( site.slug, domain.domain, currentRoute ) );
	};

	renewDomain = ( event ) => {
		event.stopPropagation();

		const { purchase, site } = this.props;
		handleRenewNowClick( purchase, site.slug );
	};

	makePrimary = ( event ) => {
		const { domainDetails, selectionIndex, onMakePrimaryClick } = this.props;

		event.stopPropagation();

		if ( onMakePrimaryClick ) {
			onMakePrimaryClick( selectionIndex, domainDetails );
		}
	};

	canRenewDomain() {
		const { domainDetails, purchase } = this.props;
		return (
			domainDetails &&
			purchase &&
			domainDetails.currentUserCanManage &&
			[ domainTypes.WPCOM, domainTypes.TRANSFER ].indexOf( domainDetails.type ) === -1 &&
			! domainDetails.bundledPlanSubscriptionId
		);
	}

	canSetAsPrimary() {
		const { domainDetails, isManagingAllSites, shouldUpgradeToMakePrimary } = this.props;
		return (
			! isManagingAllSites &&
			domainDetails &&
			domainDetails.canSetAsPrimary &&
			! domainDetails.isPrimary &&
			! shouldUpgradeToMakePrimary
		);
	}

	renderAutoRenew() {
		const { translate, domainDetails } = this.props;

		if ( ! this.shouldShowAutoRenewStatus() ) {
			return;
		}

		const autoRenewLabel = translate( 'Auto-renew: %(autoRenewValue)s', {
			args: {
				autoRenewValue: domainDetails?.isAutoRenewing ? 'on' : 'off',
			},
			comment: 'Auto-renew a domain registration. %(autoRenewValue)s can be "on" or "off"',
		} );
		return <span className="domain-item__meta-item">{ autoRenewLabel }</span>;
	}

	shouldShowAutoRenewStatus = () => {
		const { domainDetails } = this.props;
		if (
			domainDetails?.type === domainTypes.WPCOM ||
			domainDetails?.type === domainTypes.TRANSFER
		) {
			return false;
		}
		return ! domainDetails?.bundledPlanSubscriptionId;
	};

	renderOptionsButton() {
		const { disabled, isBusy, site, domain, domainDetails, currentRoute, translate } = this.props;

		return (
			<div className="list__domain-options">
				<EllipsisMenu
					disabled={ disabled || isBusy }
					onClick={ this.stopPropagation }
					toggleTitle={ translate( 'Options' ) }
				>
					{ this.canSetAsPrimary() && (
						<PopoverMenuItem icon="domains" onClick={ this.makePrimary }>
							{ translate( 'Make primary address' ) }
						</PopoverMenuItem>
					) }
					{ this.canRenewDomain() && (
						<PopoverMenuItem icon="refresh" onClick={ this.renewDomain }>
							{ translate( 'Renew now' ) }
						</PopoverMenuItem>
					) }
					<PopoverMenuItem icon="pencil">{ translate( 'Edit settings' ) }</PopoverMenuItem>
					{ domain.type === domainTypes.MAPPED && (
						<PopoverMenuItem
							icon="list-unordered"
							href={ domainManagementDns( site.slug, domain.domain, currentRoute ) }
						>
							{ translate( 'DNS Records' ) }
						</PopoverMenuItem>
					) }
					{ domain.type === domainTypes.WPCOM && ! domainDetails?.isWpcomStagingDomain && (
						<PopoverMenuItem
							icon="reblog"
							href={ domainManagementChangeSiteAddress( site.slug, domain.domain, currentRoute ) }
						>
							{ translate( 'Change site address' ) }
						</PopoverMenuItem>
					) }
					{ domain.type === domainTypes.REGISTERED &&
						( isDomainUpdateable( domainDetails ) || isDomainInGracePeriod( domainDetails ) ) && (
							<PopoverMenuItem
								icon="domains"
								href={ domainManagementNameServers( site.slug, domain.domain, currentRoute ) }
							>
								{ translate( 'Name servers' ) }
							</PopoverMenuItem>
						) }
					{ domain.type === domainTypes.REGISTERED &&
						( isDomainUpdateable( domainDetails ) || isDomainInGracePeriod( domainDetails ) ) && (
							<PopoverMenuItem
								icon="reader"
								href={ domainManagementContactsPrivacy( site.slug, domain.domain, currentRoute ) }
							>
								{ translate( 'Contact information' ) }
							</PopoverMenuItem>
						) }
					{ domain.type === domainTypes.REGISTERED &&
						! ( domainDetails?.expired && ! isDomainInGracePeriod( domainDetails ) ) && (
							<PopoverMenuItem
								icon="reply"
								href={ domainManagementTransfer( site.slug, domain.domain, currentRoute ) }
							>
								{ translate( 'Transfer domain' ) }
							</PopoverMenuItem>
						) }
					{ [ domainTypes.REGISTERED, domainTypes.MAPPED ].includes( domain.type ) &&
						domainDetails?.pointsToWpcom &&
						domainDetails?.sslStatus && (
							<PopoverMenuItem
								icon="lock"
								href={ domainManagementSecurity( site.slug, domain.domain, currentRoute ) }
							>
								{ translate( 'Security' ) }
							</PopoverMenuItem>
						) }
				</EllipsisMenu>
			</div>
		);
	}

	renderEmail( domainDetails ) {
		const { translate } = this.props;

		if ( [ domainTypes.MAPPED, domainTypes.REGISTERED ].indexOf( domainDetails.type ) === -1 ) {
			return;
		}

		if ( hasGSuiteWithUs( domainDetails ) ) {
			const gSuiteMailboxCount = getGSuiteMailboxCount( domainDetails );

			const text = translate(
				'%(gSuiteMailboxCount)d mailbox',
				'%(gSuiteMailboxCount)d mailboxes',
				{
					count: gSuiteMailboxCount,
					args: {
						gSuiteMailboxCount,
					},
					comment: 'The number of GSuite mailboxes active for the current domain',
				}
			);
			return <span className="domain-item__meta-item">{ text }</span>;
		}

		if ( hasTitanMailWithUs( domainDetails ) ) {
			const titanMailboxCount = getMaxTitanMailboxCount( domainDetails );

			const text = translate( '%(titanMailboxCount)d mailbox', '%(titanMailboxCount)d mailboxes', {
				args: {
					titanMailboxCount,
				},
				count: titanMailboxCount,
				comment: '%(titanMailboxCount)d is the number of mailboxes for the current domain',
			} );
			return <span className="domain-item__meta-item">{ text }</span>;
		}

		if ( hasEmailForwards( domainDetails ) ) {
			const emailForwardsCount = getEmailForwardsCount( domainDetails );

			const text = translate( '%(emailForwardsCount)d forward', '%(emailForwardsCount)d forwards', {
				count: emailForwardsCount,
				args: {
					emailForwardsCount,
				},
				comment: 'The number of email forwards active for the current domain',
			} );
			return <span className="domain-item__meta-item">{ text }</span>;
		}

		if ( ! canCurrentUserAddEmail( domainDetails ) ) {
			return;
		}

		return (
			<span className="domain-item__meta-item">
				<Button compact onClick={ this.addEmailClick } className="domain-item__email-button">
					{ translate( 'Add email', { context: 'Button label' } ) }
				</Button>
			</span>
		);
	}

	renderActionItems() {
		const { isLoadingDomainDetails, domainDetails, showDomainDetails } = this.props;

		if ( ! showDomainDetails ) {
			return;
		}

		if ( isLoadingDomainDetails || ! domainDetails ) {
			return <div className="list__domain-options list__action_item_placeholder" />;
		}

		return this.renderOptionsButton();
	}

	getSiteName( site ) {
		if ( site.name ) {
			return `${ site.name } (${ withoutHttp( site.URL ) })`;
		}
		return withoutHttp( site.URL );
	}

	renderSiteMeta() {
		const { showDomainDetails, isLoadingDomainDetails, domainDetails } = this.props;

		if ( ! showDomainDetails ) {
			return;
		}

		if ( isLoadingDomainDetails || ! domainDetails ) {
			return <div className="domain-item__meta domain-item__meta-placeholder" />;
		}

		return (
			<div className="domain-item__meta">
				{ this.getSiteMeta() }
				{ this.renderAutoRenew() }
				{ this.renderEmail( domainDetails ) }
			</div>
		);
	}

	getSiteMeta() {
		const { domainDetails, isManagingAllSites, site, translate } = this.props;

		if ( isManagingAllSites ) {
			return translate( 'Site: %(siteName)s', {
				args: {
					siteName: this.getSiteName( site ),
				},
				comment: '%(siteName)s is the site name and URL or just the URL used to identify a site',
			} );
		}

		if ( domainDetails.isWPCOMDomain ) {
			return (
				<div className="domain-item__meta">
					{ translate( 'Free site address' ) }

					<InfoPopover iconSize={ 18 }>
						{ translate(
							'Your WordPress.com site comes with a free address using a WordPress.com subdomain. As ' +
								'an alternative to using the free subdomain, you can instead use a custom domain ' +
								'name for your site, for example: yourgroovydomain.com.'
						) }
					</InfoPopover>
				</div>
			);
		}

		return <React.Fragment>{ getDomainTypeText( domainDetails, translate ) }</React.Fragment>;
	}

	busyMessage() {
		if ( this.props.isBusy && this.props.busyMessage ) {
			return <div className="domain-item__busy-message">{ this.props.busyMessage }</div>;
		}
	}

	renderOverlay() {
		const { isBusy } = this.props;
		if ( isBusy ) {
			return (
				<div className="domain-item__overlay">
					{ this.busyMessage() }
					<Spinner className="domain-item__spinner" size={ 20 } />
				</div>
			);
		}
		return null;
	}

	renderActionResult() {
		const { actionResult } = this.props;

		if ( ! actionResult?.type || ! actionResult?.message ) {
			return;
		}

		const { type, message } = actionResult;
		const statusClass = 'error' === type ? 'alert' : 'success';

		return <DomainNotice status={ statusClass } text={ message } />;
	}

	renderPrimaryBadge() {
		return (
			<Badge className="domain-item__primary-badge" type="info-green">
				{ this.props.translate( 'Primary site address' ) }
			</Badge>
		);
	}

	hasMappingError( domain ) {
		const registrationDatePlus3Days = moment.utc( domain.registrationDate ).add( 3, 'days' );
		return (
			domain.type === domainTypes.MAPPED &&
			! domain.pointsToWpcom &&
			moment.utc().isAfter( registrationDatePlus3Days )
		);
	}

	render() {
		const {
			domain,
			domainDetails,
			disabled,
			isBusy,
			isChecked,
			isManagingAllSites,
			showCheckbox,
			site,
		} = this.props;
		const { listStatusText, listStatusClass } = resolveDomainStatus(
			domainDetails || domain,
			null,
			{ siteSlug: site?.slug, hasMappingError: this.hasMappingError( domain ) }
		);

		const rowClasses = classNames( 'domain-item', `domain-item__status-${ listStatusClass }` );

		return (
			<CompactCard className={ rowClasses } onClick={ this.handleClick }>
				{ showCheckbox && (
					<FormCheckbox
						className="domain-item__checkbox"
						onChange={ this.onToggle }
						onClick={ this.stopPropagation }
						checked={ isChecked }
						disabled={ disabled || isBusy }
					/>
				) }
				<div className="list__domain-link">
					<div className="domain-item__status">
						<div className="domain-item__title">{ domain.domain }</div>
						{ domainDetails?.isPrimary && ! isManagingAllSites && this.renderPrimaryBadge() }
						{ this.renderActionResult() }
					</div>
					{ this.renderSiteMeta() }
					{ listStatusText && (
						<DomainNotice status={ listStatusClass || 'info' } text={ listStatusText } />
					) }
				</div>
				{ this.renderActionItems() }
				{ this.renderOverlay() }
			</CompactCard>
		);
	}
}

const trackAddEmailClick = ( domain ) =>
	recordTracksEvent( 'calypso_domain_management_domain_item_add_email_click', {
		section: domain.type,
	} );

export default connect( null, {
	trackAddEmailClick,
} )( localize( DomainItem ) );
