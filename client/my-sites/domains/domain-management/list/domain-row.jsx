import { Button } from '@automattic/components';
import { Icon, home, info, moreVertical, redo, plus } from '@wordpress/icons';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import MaterialIcon from 'calypso/components/material-icon';
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
import TransferConnectedDomainNudge from 'calypso/my-sites/domains/domain-management/components/transfer-connected-domain-nudge';
import {
	domainManagementList,
	createSiteFromDomainOnly,
	domainUseMyDomain,
} from 'calypso/my-sites/domains/paths';
import {
	emailManagement,
	emailManagementPurchaseNewEmailAccount,
} from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './domain-row.scss';

class DomainRow extends PureComponent {
	static propTypes = {
		busyMessage: PropTypes.string,
		currentRoute: PropTypes.string,
		disabled: PropTypes.bool,
		domain: PropTypes.object.isRequired,
		hasLoadedPurchases: PropTypes.bool,
		isBusy: PropTypes.bool,
		isLoadingDomainDetails: PropTypes.bool,
		isManagingAllSites: PropTypes.bool,
		isSavingContactInfo: PropTypes.bool,
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
		isSavingContactInfo: false,
		isLoadingDomainDetails: false,
		isBusy: false,
		showDomainDetails: true,
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	handleClick = () => {
		const { onClick, domain } = this.props;
		onClick( domain );
	};

	renderDomainName( domainTypeText ) {
		const { domain, isManagingAllSites } = this.props;
		return (
			<div className="domain-row__domain-cell">
				<div className="domain-row__domain-name">
					<button onClick={ this.handleClick }>{ domain.domain }</button>
				</div>
				{ domainTypeText && <div className="domain-row__domain-type-text">{ domainTypeText }</div> }
				{ domain?.isPrimary && ! isManagingAllSites && this.renderPrimaryBadge() }
			</div>
		);
	}

	renderSite() {
		const { site, translate } = this.props;
		if ( site?.options?.is_domain_only ) {
			return (
				<div className="domain-row__site-cell">
					<Button href={ createSiteFromDomainOnly( site?.slug, site?.siteId ) } plain>
						<MaterialIcon icon="add" /> { translate( 'Create site' ) }
					</Button>
				</div>
			);
		}
		return (
			<div className="domain-row__site-cell">
				<Button href={ domainManagementList( site?.slug ) } plain>
					{ site?.title || site?.slug }
				</Button>
			</div>
		);
	}

	renderMobileSite() {
		const { site } = this.props;
		if ( site?.options?.is_domain_only ) {
			return null;
		}
		return site?.title || site?.slug;
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
		const { domain, site, isLoadingDomainDetails } = this.props;
		const { status, statusClass } = resolveDomainStatus( domain, null, {
			siteSlug: site?.slug,
			getMappingErrors: true,
		} );

		const domainStatusClass = classnames( 'domain-row__status-cell', {
			'is-loading': isLoadingDomainDetails,
		} );

		return (
			<div className={ domainStatusClass }>
				<span className={ `domain-row__${ statusClass }-dot` }></span> { status }
			</div>
		);
	}

	renderExpiryDate( expiryDate ) {
		const { domain } = this.props;
		return (
			<div className="domain-row__registered-until-cell">
				{ expiryDate && domain.type !== domainTypes.MAPPED ? expiryDate.format( 'LL' ) : '-' }
			</div>
		);
	}

	renderMobileExtraInfo( expiryDate, domainTypeText ) {
		const { domain, translate } = this.props;

		let extraInfo = '';
		if ( domainTypeText ) {
			extraInfo = domainTypeText;
		} else if ( domain.expired ) {
			if ( expiryDate ) {
				extraInfo = translate( 'Expired on %(expiryDate)s', {
					args: { expiryDate: expiryDate.format( 'LL' ) },
				} );
			} else {
				extraInfo = translate( 'Expired' );
			}
		} else if ( domain.isAutoRenewing && domain.autoRenewalDate ) {
			extraInfo = translate( 'Renews on %(renewalDate)s', {
				args: { renewalDate: moment.utc( domain.autoRenewalDate ).format( 'LL' ) },
			} );
		} else if ( expiryDate ) {
			extraInfo = translate( 'Expires on %(expiryDate)s', {
				args: { expiryDate: expiryDate.format( 'LL' ) },
			} );
		}

		return <div className="domain-row__mobile-extra-info">{ extraInfo }</div>;
	}

	renderAutoRenew() {
		const { site, hasLoadedPurchases, purchase, isManagingAllSites, showCheckbox } = this.props;

		if ( ! this.shouldShowAutoRenewStatus() || ( hasLoadedPurchases && ! purchase ) ) {
			return <span className="domain-row__auto-renew-cell">-</span>;
		}

		if ( ! hasLoadedPurchases ) {
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
					shouldDisable={ isManagingAllSites && showCheckbox }
					withTextStatus={ false }
					toggleSource="registered-domain-status"
				/>
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		);
	}

	shouldShowAutoRenewStatus = () => {
		const { domain } = this.props;
		if (
			domain?.type === domainTypes.WPCOM ||
			domain?.type === domainTypes.TRANSFER ||
			domain?.aftermarketAuction
		) {
			return false;
		}
		return ! domain?.bundledPlanSubscriptionId && domain.currentUserCanManage;
	};

	renderEmail() {
		return <span className="domain-row__email-cell">{ this.renderEmailLabel() }</span>;
	}

	/* eslint-disable jsx-a11y/anchor-is-valid */
	renderEmailLabel = () => {
		const { domain, translate } = this.props;

		if ( ! [ domainTypes.MAPPED, domainTypes.REGISTERED ].includes( domain.type ) ) {
			return null;
		}

		if ( hasGSuiteWithUs( domain ) ) {
			const gSuiteMailboxCount = getGSuiteMailboxCount( domain );

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

		if ( hasTitanMailWithUs( domain ) ) {
			const titanMailboxCount = getMaxTitanMailboxCount( domain );

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

		if ( hasEmailForwards( domain ) ) {
			const emailForwardsCount = getEmailForwardsCount( domain );

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

		if ( ! canCurrentUserAddEmail( domain ) ) {
			return null;
		}

		return (
			<a href="#" onClick={ this.addEmailClick }>
				{ translate( '+ Add', { context: 'Button label' } ) }
			</a>
		);
	};
	/* eslint-enable jsx-a11y/anchor-is-valid */

	addEmailClick = ( event ) => {
		const { currentRoute, domain, site, trackAddEmailClick } = this.props;
		event.stopPropagation();

		trackAddEmailClick( domain ); // analytics/tracks

		this.goToEmailPage(
			event,
			emailManagementPurchaseNewEmailAccount( site.slug, domain.domain, currentRoute )
		);
	};

	goToEmailPage = ( event, targetPath ) => {
		const { currentRoute, disabled, domain, site } = this.props;
		event.stopPropagation();
		event.preventDefault();

		if ( disabled ) {
			return;
		}

		const emailPath = targetPath
			? targetPath
			: emailManagement( site.slug, domain.domain, currentRoute );

		page( emailPath );
	};

	renderEllipsisMenu() {
		const {
			isLoadingDomainDetails,
			site,
			domain,
			showDomainDetails,
			disabled,
			isBusy,
			translate,
		} = this.props;

		if ( ! showDomainDetails ) {
			return <div className="domain-row__action-cell"></div>;
		}

		if ( isLoadingDomainDetails || ! domain || ! site ) {
			return (
				<div className="domain-row__action-cell">
					<p className="domain-row__placeholder" />
				</div>
			);
		}

		return (
			<div className="domain-row__action-cell">
				{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
				<EllipsisMenu
					disabled={ disabled || isBusy }
					onClick={ this.stopPropagation }
					toggleTitle={ translate( 'Options' ) }
					icon={ <Icon icon={ moreVertical } size={ 28 } className="gridicon" /> }
					popoverClassName="domain-row__popover"
					position="bottom"
				>
					<PopoverMenuItem icon="domains" onClick={ this.handleClick }>
						{ domain.type === domainTypes.TRANSFER
							? translate( 'View transfer' )
							: translate( 'View settings' ) }
					</PopoverMenuItem>
					{ this.canSetAsPrimary() && (
						<PopoverMenuItem onClick={ this.makePrimary }>
							<Icon icon={ home } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ translate( 'Make primary site address' ) }
						</PopoverMenuItem>
					) }
					{ domain.type === domainTypes.MAPPED && domain.isEligibleForInboundTransfer && (
						<PopoverMenuItem
							href={ domainUseMyDomain(
								site.slug,
								domain.name,
								useMyDomainInputMode.transferDomain
							) }
						>
							<Icon icon={ redo } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ translate( 'Transfer to WordPress.com' ) }
						</PopoverMenuItem>
					) }
					{ site.options?.is_domain_only && (
						<PopoverMenuItem href={ createSiteFromDomainOnly( site.slug, site.siteId ) }>
							<Icon icon={ plus } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ translate( 'Create site' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
				{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
			</div>
		);
	}

	canSetAsPrimary() {
		const { domain, isManagingAllSites, shouldUpgradeToMakePrimary } = this.props;
		return (
			! isManagingAllSites &&
			domain &&
			domain.canSetAsPrimary &&
			! domain.isPrimary &&
			! shouldUpgradeToMakePrimary
		);
	}

	makePrimary = ( event ) => {
		event.stopPropagation();

		const { domain, selectionIndex, onMakePrimaryClick } = this.props;
		if ( onMakePrimaryClick ) {
			onMakePrimaryClick( selectionIndex, domain );
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

	handleDomainSelection = ( event ) => {
		const { domain } = this.props;
		return this.props.handleDomainItemToggle( domain.name, event.target.checked );
	};

	renderDomainCheckbox() {
		const { domain, isSavingContactInfo } = this.props;
		return (
			<div className="domain-row__checkbox-cell">
				<FormCheckbox
					className="domain-row__checkbox"
					onChange={ this.handleDomainSelection }
					checked={ domain.selected }
					disabled={ isSavingContactInfo }
				/>
			</div>
		);
	}

	busyMessage() {
		if ( this.props.isBusy && this.props.busyMessage ) {
			return <div className="domain-row__busy-message">{ this.props.busyMessage }</div>;
		}
	}

	render() {
		const { domain, isManagingAllSites, site, showCheckbox, purchase, translate } = this.props;
		const domainTypeText = getDomainTypeText( domain, translate, domainInfoContext.DOMAIN_ROW );
		const expiryDate = domain?.expiry ? moment.utc( domain?.expiry ) : null;
		const { noticeText, statusClass } = resolveDomainStatus( domain, purchase, {
			siteSlug: site?.slug,
			getMappingErrors: true,
		} );

		return (
			<div className="domain-row">
				<div className="domain-row__mobile-container">
					{ isManagingAllSites && showCheckbox && this.renderDomainCheckbox() }
					{ this.renderDomainName( domainTypeText ) }
					{ isManagingAllSites && this.renderSite() }
					{ this.renderDomainStatus() }
					{ this.renderExpiryDate( expiryDate ) }
					{ this.renderAutoRenew() }
					{ ! isManagingAllSites && this.renderEmail() }
					{ this.renderEllipsisMenu() }
				</div>
				<div className="domain-row__mobile-container2">
					{ isManagingAllSites && this.renderMobileSite() }
				</div>
				<div className="domain-row__mobile-container3">
					{ this.renderDomainStatus() }
					{ this.renderMobileExtraInfo( expiryDate, domainTypeText ) }
				</div>
				{ noticeText && (
					<div className="domain-row__domain-notice">
						<Icon
							icon={ info }
							size={ 18 }
							className={ classnames( 'domain-row__domain-notice-icon gridicon', {
								'gridicon--error': 'status-success' !== statusClass,
								'gridicon--success': 'status-success' === statusClass,
							} ) }
							viewBox="2 2 20 20"
						/>
						<div className="domain-row__domain-notice-message">{ noticeText }</div>
					</div>
				) }
				{ site && (
					<TransferConnectedDomainNudge
						domain={ domain }
						location="domains_list"
						siteSlug={ site.slug }
					/>
				) }
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
