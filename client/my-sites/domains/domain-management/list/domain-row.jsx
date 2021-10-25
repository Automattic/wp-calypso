import { Button } from '@automattic/components';
import { Icon, home } from '@wordpress/icons';
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
	};

	static defaultProps = {
		disabled: false,
		isManagingAllSites: false,
		isLoadingDomainDetails: false,
		isBusy: false,
		showDomainDetails: true,
	};

	hasMappingError( domain ) {
		const registrationDatePlus3Days = moment.utc( domain.registrationDate ).add( 3, 'days' );
		return (
			domain.type === domainTypes.MAPPED &&
			! domain.pointsToWpcom &&
			moment.utc().isAfter( registrationDatePlus3Days )
		);
	}

	handleClick = () => {
		const { onClick, domainDetails } = this.props;
		onClick( domainDetails );
	};

	renderDomainName() {
		const { domain, domainDetails, isManagingAllSites, translate } = this.props;
		return (
			<div className="domain-row__domain-cell">
				<span className="domain-row__domain-name">{ domain.domain }</span>
				<div>{ getDomainTypeText( domainDetails, translate, domainInfoContext.DOMAIN_ROW ) }</div>
				{ domainDetails?.isPrimary && ! isManagingAllSites && this.renderPrimaryBadge() }
			</div>
		);
	}

	renderPrimaryBadge() {
		return (
			<Badge className="domain-row__primary-badge" type="info-green">
				<Icon icon={ home } size={ 14 } /> { this.props.translate( 'Primary site address' ) }
			</Badge>
		);
	}

	renderDomainStatus( status, statusClass ) {
		return (
			<div className="domain-row__status-cell">
				<span className={ `domain-row__${ statusClass }-dot` }></span> { status }
			</div>
		);
	}

	renderExpiryDate() {
		const { domain, domainDetails } = this.props;
		const expiryDate = moment.utc( domainDetails?.expiry || domain?.expiry ).format( 'LL' );
		return <div className="domain-row__registered-until-cell">{ expiryDate || '-' }</div>;
	}

	renderAutoRenew() {
		const { site, purchase } = this.props;

		if ( ! this.shouldShowAutoRenewStatus() ) {
			return <span className="domain-row__auto-renew-cell">-</span>;
		}

		if ( ! purchase ) {
			return (
				<span className="domain-row__auto-renew-cell">
					<p className="domain-row__placeholder" />
				</span>
			);
		}

		return (
			<div className="domain-row__auto-renew-cell" onClick={ ( e ) => e.stopPropagation() }>
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

	addEmailClick = ( event ) => {
		const { trackAddEmailClick, currentRoute, disabled, domain, site } = this.props;
		event.stopPropagation();

		trackAddEmailClick( domain ); // analytics/tracks

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

		return (
			<div className="domain-row__action-cell">
				<EllipsisMenu
					disabled={ disabled || isBusy }
					onClick={ ( e ) => e.stopPropagation() }
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
		const { domain, domainDetails, site } = this.props;
		const { status, statusClass } = resolveDomainStatus( domainDetails || domain, null, {
			siteSlug: site?.slug,
			hasMappingError: this.hasMappingError( domain ),
		} );

		return (
			<div className="domain-row" onClick={ this.handleClick }>
				<div className="domain-row__mobile-container">
					{ this.renderDomainName() }
					<div className="domain-row__mobile-status-container">
						{ this.renderDomainStatus( status, statusClass ) }
						{ this.renderExpiryDate() }
					</div>
					{ this.renderAutoRenew() }
					{ this.renderEmail() }
				</div>
				{ this.renderEllipsisMenu() }
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
