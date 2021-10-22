import { Button } from '@automattic/components';
import { Icon, home } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import { Fragment, PureComponent } from 'react';
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
import { handleRenewNowClick } from 'calypso/lib/purchases';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import { withoutHttp } from 'calypso/lib/url';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import DomainNotice from 'calypso/my-sites/domains/domain-management/components/domain-notice';
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
		site: PropTypes.object,
		isManagingAllSites: PropTypes.bool,
		isBusy: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onMakePrimaryClick: PropTypes.func,
		shouldUpgradeToMakePrimary: PropTypes.bool,
		purchase: PropTypes.object,
		isLoadingDomainDetails: PropTypes.bool,
		selectionIndex: PropTypes.number,
		showDomainDetails: PropTypes.bool,
		actionResult: PropTypes.object,
	};

	static defaultProps = {
		disabled: false,
		isManagingAllSites: false,
		isLoadingDomainDetails: false,
		isBusy: false,
		showDomainDetails: true,
	};

	handleClick = () => {
		const { onClick, domainDetails } = this.props;
		onClick( domainDetails );
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
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

	makePrimary = ( event ) => {
		event.stopPropagation();

		const { domainDetails, selectionIndex, onMakePrimaryClick } = this.props;
		if ( onMakePrimaryClick ) {
			onMakePrimaryClick( selectionIndex, domainDetails );
		}
	};

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
		const { site, purchase } = this.props;

		if ( ! this.shouldShowAutoRenewStatus() ) {
			return <span className="domain-row__auto-renew-cell">-</span>;
		}

		if ( ! purchase ) {
			return (
				<span className="domain-row__auto-renew-cell">
					<p className="domain-row__auto-renew-placeholder" />
				</span>
			);
		}

		return (
			<div className="domain-row__auto-renew-cell" onClick={ this.stopPropagation }>
				<AutoRenewToggle
					planName={ site.plan.product_name_short }
					siteDomain={ site.domain }
					purchase={ purchase }
					withTextStatus={ false }
					toggleSource="registered-domain-status"
				/>
			</div>
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

	renderOptionsButton() {
		const { disabled, isBusy, translate } = this.props;

		return (
			<div className="domain-row__action-cell">
				<EllipsisMenu
					disabled={ disabled || isBusy }
					onClick={ this.stopPropagation }
					toggleTitle={ translate( 'Options' ) }
				>
					<PopoverMenuItem icon="domains">{ translate( 'View settings' ) }</PopoverMenuItem>
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
	}

	renderEmail() {
		const { domainDetails, translate } = this.props;

		if ( [ domainTypes.MAPPED, domainTypes.REGISTERED ].indexOf( domainDetails.type ) === -1 ) {
			return <span className="domain-row__email-cell">-</span>;
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
			return <span className="domain-row__email-cell">{ text }</span>;
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
			return <span className="domain-row__email-cell">{ text }</span>;
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
			return <span className="domain-row__email-cell">{ text }</span>;
		}

		if ( ! canCurrentUserAddEmail( domainDetails ) ) {
			return <span className="domain-row__email-cell">-</span>;
		}

		return (
			<span className="domain-row__email-cell">
				<Button compact onClick={ this.addEmailClick } className="domain-row__email-button">
					{ translate( 'Add +', { context: 'Button label' } ) }
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

		return <Fragment>{ getDomainTypeText( domainDetails, translate ) }</Fragment>;
	}

	busyMessage() {
		if ( this.props.isBusy && this.props.busyMessage ) {
			return <div className="domain-row__busy-message">{ this.props.busyMessage }</div>;
		}
	}

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
			<Badge className="domain-row__primary-badge" type="info-green">
				<Icon icon={ home } size={ 14 } /> { this.props.translate( 'Primary site address' ) }
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

	getSiteMeta2() {
		const { domainDetails, translate } = this.props;
		return (
			<Fragment>
				{ getDomainTypeText( domainDetails, translate, domainInfoContext.DOMAIN_ROW ) }
			</Fragment>
		);
	}

	renderDomainName() {
		const { domain, domainDetails, isManagingAllSites } = this.props;
		return (
			<div className="domain-row__domain-cell">
				<span className="domain-row__domain-name">{ domain.domain }</span>
				<div>{ this.getSiteMeta2() }</div>
				{ domainDetails?.isPrimary && ! isManagingAllSites && this.renderPrimaryBadge() }
			</div>
		);
	}

	renderDomainStatus( status, statusColor ) {
		return (
			<div className="domain-row__status-cell">
				<span className={ `domain-row__${ statusColor }-dot` }></span> { status }
			</div>
		);
	}

	renderExpiryDate() {
		const { domain, domainDetails } = this.props;
		const expiryDate = moment.utc( domainDetails?.expiry || domain?.expiry ).format( 'LL' );
		return <div className="domain-row__registered-until-cell">{ expiryDate || '-' }</div>;
	}

	render() {
		const { domain, domainDetails, site } = this.props;
		const { status, statusColor } = resolveDomainStatus( domainDetails || domain, null, {
			siteSlug: site?.slug,
			hasMappingError: this.hasMappingError( domain ),
		} );

		return (
			<div className="domain-row" onClick={ this.handleClick }>
				{ this.renderDomainName() }
				{ this.renderDomainStatus( status, statusColor ) }
				{ this.renderExpiryDate() }
				{ this.renderAutoRenew() }
				{ this.renderEmail() }
				{ this.renderActionItems() }
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
