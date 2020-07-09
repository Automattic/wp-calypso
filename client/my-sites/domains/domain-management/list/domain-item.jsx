/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import DomainNotice from 'my-sites/domains/domain-management/components/domain-notice';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { hasGSuiteWithUs, getGSuiteMailboxCount } from 'lib/gsuite';
import { withoutHttp } from 'lib/url';
import { type as domainTypes } from 'lib/domains/constants';
import { handleRenewNowClick } from 'lib/purchases';
import { resolveDomainStatus } from 'lib/domains';
import InfoPopover from 'components/info-popover';
import { emailManagement } from 'my-sites/email/paths';

class DomainItem extends PureComponent {
	static propTypes = {
		currentRoute: PropTypes.string,
		domain: PropTypes.object.isRequired,
		domainDetails: PropTypes.object,
		site: PropTypes.object,
		isManagingAllSites: PropTypes.bool,
		showCheckbox: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onToggle: PropTypes.func,
		purchase: PropTypes.object,
		isLoadingDomainDetails: PropTypes.bool,
	};

	static defaultProps = {
		isManagingAllSites: false,
		showCheckbox: false,
		onToggle: null,
		isLoadingDomainDetails: false,
	};

	handleClick = () => {
		this.props.onClick( this.props.domainDetails );
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
		const { currentRoute, domain, site } = this.props;
		event.stopPropagation();
		page( emailManagement( site.slug, domain.domain, currentRoute ) );
	};

	renewDomain = ( event ) => {
		event.stopPropagation();

		const { purchase, site } = this.props;
		handleRenewNowClick( purchase, site.slug );
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
		const { isManagingAllSites, translate } = this.props;

		return (
			<div className="list__domain-options">
				<EllipsisMenu onClick={ this.stopPropagation } toggleTitle={ translate( 'Options' ) }>
					{ ! isManagingAllSites && (
						<PopoverMenuItem icon="domains">{ translate( 'Make primary domain' ) }</PopoverMenuItem>
					) }
					{ this.canRenewDomain() && (
						<PopoverMenuItem icon="refresh" onClick={ this.renewDomain }>
							{ translate( 'Renew now' ) }
						</PopoverMenuItem>
					) }
					<PopoverMenuItem icon="pencil">{ translate( 'Edit settings' ) }</PopoverMenuItem>
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
		const { domainDetails, isManagingAllSites, site, translate } = this.props;

		if ( isManagingAllSites ) {
			return (
				<div className="domain-item__meta">
					{ translate( 'Site: %(siteName)s', {
						args: {
							siteName: this.getSiteName( site ),
						},
						comment:
							'%(siteName)s is the site name and URL or just the URL used to identify a site',
					} ) }
				</div>
			);
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

		return null;
	}

	render() {
		const { domain, domainDetails, isManagingAllSites, showCheckbox } = this.props;
		const { listStatusText, listStatusClass } = resolveDomainStatus( domainDetails || domain );

		const rowClasses = classNames( 'domain-item', `domain-item__status-${ listStatusClass }` );
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
			</CompactCard>
		);
	}
}

export default localize( DomainItem );
