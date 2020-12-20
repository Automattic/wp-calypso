/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormRadio from 'calypso/components/forms/form-radio';
import DomainNotice from 'calypso/my-sites/domains/domain-management/components/domain-notice';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { hasGSuiteWithUs, getGSuiteMailboxCount } from 'calypso/lib/gsuite';
import { withoutHttp } from 'calypso/lib/url';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { handleRenewNowClick } from 'calypso/lib/purchases';
import {
	resolveDomainStatus,
	isDomainInGracePeriod,
	isDomainUpdateable,
	getDomainTypeText,
} from 'calypso/lib/domains';
import InfoPopover from 'calypso/components/info-popover';
import { emailManagement } from 'calypso/my-sites/email/paths';
import {
	domainManagementChangeSiteAddress,
	domainManagementContactsPrivacy,
	domainManagementNameServers,
	domainManagementTransfer,
	domainManagementDns,
	domainManagementSecurity,
} from 'calypso/my-sites/domains/paths';
import Spinner from 'calypso/components/spinner';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { hasTitanMailWithUs } from 'calypso/lib/titan/has-titan-mail-with-us';

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
		onSelect: PropTypes.func,
		onToggle: PropTypes.func,
		onUpgradeClick: PropTypes.func,
		shouldUpgradeToMakePrimary: PropTypes.bool,
		purchase: PropTypes.object,
		isLoadingDomainDetails: PropTypes.bool,
		selectionIndex: PropTypes.number,
		enableSelection: PropTypes.bool,
	};

	static defaultProps = {
		disabled: false,
		isManagingAllSites: false,
		showCheckbox: false,
		onToggle: null,
		isLoadingDomainDetails: false,
		isBusy: false,
	};

	handleClick = ( e ) => {
		if ( this.props.enableSelection ) {
			this.onSelect( e );
		} else {
			this.props.onClick( this.props.domainDetails );
		}
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	onToggle = ( event ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( event.target.checked );
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

	onSelect = ( event ) => {
		const { domainDetails, selectionIndex, onSelect } = this.props;
		event.stopPropagation();
		onSelect( selectionIndex, domainDetails );
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

	upgradeToMakePrimary() {
		const { translate } = this.props;

		return (
			<div className="domain-item__upsell">
				<span>{ translate( 'Upgrade to a paid plan to make this your primary domain' ) }</span>
				<Button primary onClick={ this.props.onUpgradeClick }>
					{ translate( 'Upgrade' ) }
				</Button>
				<TrackComponentView eventName="calypso_domain_management_list_change_primary_upgrade_impression" />
			</div>
		);
	}

	renderCheckmark( present ) {
		return present ? <Gridicon className="domain-item__icon" size={ 18 } icon="checkmark" /> : null;
	}

	renderMinus() {
		return <Gridicon className="domain-item__icon" size={ 18 } icon="minus" />;
	}

	renderTransferLock() {
		const { domainDetails } = this.props;
		if ( domainDetails?.type === domainTypes.REGISTERED ) {
			return this.renderCheckmark( domainDetails?.isLocked );
		}

		return this.renderMinus();
	}

	renderAutoRenew() {
		const { domainDetails } = this.props;
		switch ( domainDetails?.type ) {
			case domainTypes.WPCOM:
			case domainTypes.TRANSFER:
				return this.renderMinus();
			default:
				return domainDetails?.bundledPlanSubscriptionId
					? this.renderMinus()
					: this.renderCheckmark( domainDetails?.isAutoRenewing );
		}
	}

	renderPrivacy() {
		const { domainDetails } = this.props;
		if ( domainDetails?.type === domainTypes.REGISTERED ) {
			return this.renderCheckmark( domainDetails?.privateDomain );
		}

		return this.renderMinus();
	}

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
							{ translate( 'Make primary domain' ) }
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
			return this.renderMinus();
		}

		if ( hasGSuiteWithUs( domainDetails ) ) {
			const gSuiteMailboxCount = getGSuiteMailboxCount( domainDetails );
			return translate( '%(gSuiteMailboxCount)d mailbox', '%(gSuiteMailboxCount)d mailboxes', {
				count: gSuiteMailboxCount,
				args: {
					gSuiteMailboxCount,
				},
				comment: 'The number of GSuite mailboxes active for the current domain',
			} );
		}

		if ( hasTitanMailWithUs( domainDetails ) ) {
			return translate( 'Titan Mail' );
		}

		if ( domainDetails?.emailForwardsCount > 0 ) {
			return translate( '%(emailForwardsCount)d forward', '%(emailForwardsCount)d forwards', {
				count: domainDetails.emailForwardsCount,
				args: {
					emailForwardsCount: domainDetails.emailForwardsCount,
				},
				comment: 'The number of email forwards active for the current domain',
			} );
		}

		return (
			<Button compact onClick={ this.addEmailClick }>
				{ translate( 'Add', {
					context: 'Button label',
					comment: '"Add" as in "Add an email"',
				} ) }
			</Button>
		);
	}

	renderActionItems() {
		const { isLoadingDomainDetails, domainDetails } = this.props;

		if ( isLoadingDomainDetails || ! domainDetails ) {
			return (
				<>
					<div className="list__domain-transfer-lock list__action_item_placeholder" />
					<div className="list__domain-privacy list__action_item_placeholder" />
					<div className="list__domain-auto-renew list__action_item_placeholder" />
					<div className="list__domain-email list__action_item_placeholder" />
					<div className="list__domain-options list__action_item_placeholder" />
				</>
			);
		}

		return (
			<>
				<div className="list__domain-transfer-lock">{ this.renderTransferLock() }</div>
				<div className="list__domain-privacy">{ this.renderPrivacy() }</div>
				<div className="list__domain-auto-renew">{ this.renderAutoRenew() }</div>
				<div className="list__domain-email">{ this.renderEmail( domainDetails ) }</div>
				{ this.renderOptionsButton() }
			</>
		);
	}

	getSiteName( site ) {
		if ( site.name ) {
			return `${ site.name } (${ withoutHttp( site.URL ) })`;
		}
		return withoutHttp( site.URL );
	}

	renderSiteMeta() {
		return <div className="domain-item__meta">{ this.getSiteMeta() }</div>;
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
		const { enableSelection, isBusy, shouldUpgradeToMakePrimary } = this.props;
		if ( isBusy ) {
			return (
				<div className="domain-item__overlay">
					{ this.busyMessage() }
					<Spinner className="domain-item__spinner" size={ 20 } />
				</div>
			);
		}

		if ( enableSelection && shouldUpgradeToMakePrimary ) {
			return (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
				<div className="domain-item__overlay" onClick={ this.stopPropagation }>
					{ this.upgradeToMakePrimary() }
				</div>
			);
		}

		return null;
	}

	render() {
		const { domain, domainDetails, isManagingAllSites, showCheckbox, enableSelection } = this.props;
		const { listStatusText, listStatusClass } = resolveDomainStatus( domainDetails || domain );

		const rowClasses = classNames( 'domain-item', `domain-item__status-${ listStatusClass }`, {
			'domain-item__enable-selection': enableSelection,
		} );
		const domainTitleClass = classNames( 'domain-item__title', {
			'domain-item__primary': ! isManagingAllSites && domainDetails?.isPrimary,
		} );

		return (
			<CompactCard className={ rowClasses } onClick={ this.handleClick }>
				{ showCheckbox && (
					<FormCheckbox
						className="domain-item__checkbox"
						onChange={ this.onToggle }
						onClick={ this.stopPropagation }
					/>
				) }
				{ enableSelection && (
					<FormRadio className="domain-item__checkbox" onClick={ this.onSelect } />
				) }
				<div className="list__domain-link">
					<div className="domain-item__status">
						<div className={ domainTitleClass }>{ domain.domain }</div>
						{ listStatusText && (
							<DomainNotice status={ listStatusClass || 'info' } text={ listStatusText } />
						) }
					</div>
					{ this.renderSiteMeta() }
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
