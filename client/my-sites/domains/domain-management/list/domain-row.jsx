import { Icon, home, moreVertical } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Spinner from 'calypso/components/spinner';
import {
	canCurrentUserAddEmail,
	getDomainTypeText,
	resolveDomainStatus,
} from 'calypso/lib/domains';
import { type as domainTypes, domainInfoContext } from 'calypso/lib/domains/constants';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs, getGSuiteMailboxCount } from 'calypso/lib/gsuite';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './domain-row.scss';

class DomainRow extends PureComponent {
	static propTypes = {
		busyMessage: PropTypes.string,
		currentRoute: PropTypes.string,
		disabled: PropTypes.bool,
		domain: PropTypes.object.isRequired,
		domainDetails: PropTypes.object,
		enableAllDomainsView: PropTypes.bool,
		isBusy: PropTypes.bool,
		isLoadingDomainDetails: PropTypes.bool,
		isManagingAllSites: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onMakePrimaryClick: PropTypes.func,
		purchase: PropTypes.object,
		selectionIndex: PropTypes.number,
		shouldUpgradeToMakePrimary: PropTypes.bool,
		showDomainDetails: PropTypes.bool,
		site: PropTypes.object,
	};

	static defaultProps = {
		disabled: false,
		isManagingAllSites: false,
		isLoadingDomainDetails: false,
		isBusy: false,
		showDomainDetails: true,
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	handleClick = () => {
		const { onClick, domainDetails } = this.props;
		onClick( domainDetails );
	};

	renderDomainName( domainTypeText ) {
		const { domain, domainDetails, isManagingAllSites } = this.props;
		return (
			<div className="domain-row__domain-cell">
				<div className="domain-row__domain-name">
					{ /* eslint-disable jsx-a11y/anchor-is-valid */ }
					<a href="#" onClick={ this.handleClick }>
						{ domain.domain }
					</a>
					{ /* eslint-enable jsx-a11y/anchor-is-valid */ }
				</div>
				{ domainTypeText && <div className="domain-row__domain-type-text">{ domainTypeText }</div> }
				{ domainDetails?.isPrimary && ! isManagingAllSites && this.renderPrimaryBadge() }
			</div>
		);
	}

	renderSite() {
		const { site } = this.props;
		return <div className="domain-row__site-cell">{ site?.slug }</div>;
	}

	renderPrimaryBadge() {
		return (
			<Badge className="domain-row__primary-badge" type="info-green">
				<Icon icon={ home } size={ 14 } />
				{ this.props.translate( 'Primary site address' ) }
			</Badge>
		);
	}

	renderDomainStatus() {
		const { domain, domainDetails, site } = this.props;
		const { status, statusClass } = resolveDomainStatus( domainDetails || domain, null, {
			siteSlug: site?.slug,
			getMappingErrors: true,
		} );

		return (
			<div className="domain-row__status-cell">
				<span className={ `domain-row__${ statusClass }-dot` }></span> { status }
			</div>
		);
	}

	renderExpiryDate( expiryDate ) {
		return (
			<div className="domain-row__registered-until-cell">{ expiryDate.format( 'LL' ) || '-' }</div>
		);
	}

	renderMobileExtraInfo( expiryDate, domainTypeText ) {
		const { domain } = this.props;

		let extraInfo = '';
		if ( domainTypeText ) {
			extraInfo = domainTypeText;
		} else if ( domain.expired ) {
			extraInfo = 'Expired on ' + expiryDate.format( 'LL' );
		} else if ( domain.isAutoRenewing && domain.autoRenewalDate ) {
			extraInfo = 'Renews on ' + moment.utc( domain.autoRenewalDate ).format( 'LL' );
		} else {
			extraInfo = 'Expires on ' + expiryDate.format( 'LL' );
		}

		return <div className="domain-row__mobile-extra-info">{ extraInfo }</div>;
	}

	renderAutoRenew() {
		const { site, purchase } = this.props;

		if ( ! this.shouldShowAutoRenewStatus() ) {
			return <span className="domain-row__auto-renew-cell">-</span>;
		}

		if ( ! purchase || ! site ) {
			return (
				<span className="domain-row__auto-renew-cell">
					<p className="domain-row__placeholder" />
				</span>
			);
		}

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
			<div className="domain-row__auto-renew-cell" onClick={ this.stopPropagation }>
				<AutoRenewToggle
					planName={ site.plan.product_name_short }
					siteDomain={ site.domain }
					purchase={ purchase }
					withTextStatus={ false }
					toggleSource="registered-domain-status"
				/>
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		);
	}

	shouldShowAutoRenewStatus = () => {
		const { domainDetails } = this.props;
		if (
			domainDetails?.type === domainTypes.WPCOM ||
			domainDetails?.type === domainTypes.TRANSFER
		) {
			return false;
		}
		return ! domainDetails?.bundledPlanSubscriptionId && domainDetails.currentUserCanManage;
	};

	renderEmail() {
		return <span className="domain-row__email-cell">{ this.renderEmailLabel() }</span>;
	}

	/* eslint-disable jsx-a11y/anchor-is-valid */
	renderEmailLabel = () => {
		const { domainDetails, translate } = this.props;

		if ( [ domainTypes.MAPPED, domainTypes.REGISTERED ].indexOf( domainDetails.type ) === -1 ) {
			return null;
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
			return (
				<a href="#" onClick={ this.goToEmailPage }>
					{ text }
				</a>
			);
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
			return (
				<a href="#" onClick={ this.goToEmailPage }>
					{ text }
				</a>
			);
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
			return (
				<a href="#" onClick={ this.goToEmailPage }>
					{ text }
				</a>
			);
		}

		if ( ! canCurrentUserAddEmail( domainDetails ) ) {
			return null;
		}

		return (
			<a href="#" onClick={ this.addEmailClick }>
				{ translate( 'Add +', { context: 'Button label' } ) }
			</a>
		);
	};
	/* eslint-enable jsx-a11y/anchor-is-valid */

	addEmailClick = ( event ) => {
		const { trackAddEmailClick, domain } = this.props;
		event.stopPropagation();

		trackAddEmailClick( domain ); // analytics/tracks
		this.goToEmailPage( event );
	};

	goToEmailPage = ( event ) => {
		const { currentRoute, disabled, domain, site } = this.props;
		event.stopPropagation();

		if ( disabled ) {
			return;
		}
		page( emailManagement( site.slug, domain.domain, currentRoute ) );
	};

	renderEllipsisMenu() {
		const {
			isLoadingDomainDetails,
			domainDetails,
			showDomainDetails,
			disabled,
			isBusy,
			translate,
		} = this.props;

		if ( ! showDomainDetails ) {
			return <div className="domain-row__action-cell"></div>;
		}

		if ( isLoadingDomainDetails || ! domainDetails ) {
			return (
				<div className="domain-row__action-cell">
					<p className="domain-row__placeholder" />
				</div>
			);
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="domain-row__action-cell">
				<EllipsisMenu
					disabled={ disabled || isBusy }
					onClick={ this.stopPropagation }
					toggleTitle={ translate( 'Options' ) }
					icon={ <Icon icon={ moreVertical } size={ 28 } className="gridicon" /> }
					popoverClassName="domain-row__popover"
				>
					<PopoverMenuItem icon="domains" onClick={ this.handleClick }>
						{ translate( 'View settings' ) }
					</PopoverMenuItem>
					{ this.canSetAsPrimary() && (
						<PopoverMenuItem onClick={ this.makePrimary }>
							{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
							<Icon icon={ home } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
							{ translate( 'Make primary site address' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
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

	makePrimary = ( event ) => {
		event.stopPropagation();

		const { domainDetails, selectionIndex, onMakePrimaryClick } = this.props;
		if ( onMakePrimaryClick ) {
			onMakePrimaryClick( selectionIndex, domainDetails );
		}
	};

	renderOverlay() {
		return (
			this.props.isBusy && (
				<div className="domain-row__overlay">
					{ this.busyMessage() }
					<Spinner size={ 20 } />
				</div>
			)
		);
	}

	busyMessage() {
		if ( this.props.isBusy && this.props.busyMessage ) {
			return <div className="domain-row__busy-message">{ this.props.busyMessage }</div>;
		}
	}

	render() {
		const { domain, domainDetails, enableAllDomainsView, translate } = this.props;
		const domainTypeText = getDomainTypeText(
			domainDetails,
			translate,
			domainInfoContext.DOMAIN_ROW
		);
		const expiryDate = moment.utc( domainDetails?.expiry || domain?.expiry );

		return (
			<div className="domain-row">
				<div className="domain-row__mobile-container">
					{ this.renderDomainName( domainTypeText ) }
					{ enableAllDomainsView && this.renderSite() }
					{ this.renderDomainStatus() }
					{ this.renderExpiryDate( expiryDate ) }
					{ this.renderAutoRenew() }
					{ ! enableAllDomainsView && this.renderEmail() }
					{ this.renderEllipsisMenu() }
				</div>
				<div className="domain-row__mobile-container2">
					{ this.renderDomainStatus() }
					{ this.renderMobileExtraInfo( expiryDate, domainTypeText ) }
				</div>
				{ this.renderOverlay() }
			</div>
		);
	}
}

const trackAddEmailClick = ( domain ) =>
	recordTracksEvent( 'calypso_domain_management_domain_item_add_email_click', {
		section: domain.type,
	} );

export default connect( null, {
	trackAddEmailClick,
} )( localize( DomainRow ) );
