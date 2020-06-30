/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

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

class DomainItem extends PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		domainDetails: PropTypes.object,
		site: PropTypes.object,
		isManagingAllSites: PropTypes.bool,
		showSite: PropTypes.bool,
		showCheckbox: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onAddEmailClick: PropTypes.func.isRequired,
		onToggle: PropTypes.func,
	};

	static defaultProps = {
		isManagingAllSites: false,
		showSite: false,
		showCheckbox: false,
		onToggle: null,
	};

	handleClick = () => {
		this.props.onClick( this.props.domain );
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
		const { domain, onAddEmailClick } = this.props;
		event.stopPropagation();
		onAddEmailClick( domain );
	};

	renderOptionsButton() {
		const { isManagingAllSites, translate } = this.props;

		return (
			<div className="list__domain-options">
				<EllipsisMenu onClick={ this.stopPropagation } toggleTitle={ translate( 'Options' ) }>
					{ ! isManagingAllSites && (
						<PopoverMenuItem icon="domains">{ translate( 'Make primary domain' ) }</PopoverMenuItem>
					) }
					<PopoverMenuItem icon="refresh">{ translate( 'Renew now' ) }</PopoverMenuItem>
					<PopoverMenuItem icon="sync">{ translate( 'Turn off auto-renew' ) }</PopoverMenuItem>
					<PopoverMenuItem icon="pencil">{ translate( 'Edit settings' ) }</PopoverMenuItem>
				</EllipsisMenu>
			</div>
		);
	}

	renderEmail( domainDetails ) {
		const { translate } = this.props;

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

	getSiteName( site ) {
		if ( site.name ) {
			return `${ site.name } (${ withoutHttp( site.URL ) })`;
		}
		return withoutHttp( site.URL );
	}

	render() {
		const { domain, showSite, site, showCheckbox, domainDetails, translate } = this.props;

		return (
			<CompactCard className="domain-item" onClick={ this.handleClick }>
				{ showCheckbox && (
					<FormCheckbox
						className="domain-item__checkbox"
						onChange={ this.onToggle }
						onClick={ this.stopPropagation }
					/>
				) }
				<div className="list__domain-link">
					<div className="domain-item__status">
						<div className="domain-item__title">{ domain.domain }</div>
						<DomainNotice status="info" text="Activating domain" />
					</div>
					{ showSite && (
						<div className="domain-item__meta">
							{ translate( 'Site: %(siteName)s', {
								args: {
									siteName: this.getSiteName( site ),
								},
								comment:
									'%(siteName)s is the site name and URL or just the URL used to identify a site',
							} ) }
						</div>
					) }
				</div>
				<div className="list__domain-transfer-lock">
					{ domainDetails?.isLocked && (
						<Gridicon className="domain-item__icon" size={ 18 } icon="checkmark" />
					) }
				</div>
				<div className="list__domain-privacy">
					{ domainDetails?.privateDomain && (
						<Gridicon className="domain-item__icon" size={ 18 } icon="checkmark" />
					) }
				</div>
				<div className="list__domain-auto-renew">
					<Gridicon className="domain-item__icon" size={ 18 } icon="minus" />
				</div>
				<div className="list__domain-email">{ this.renderEmail( domainDetails ) }</div>
				{ this.renderOptionsButton() }
			</CompactCard>
		);
	}
}

export default localize( DomainItem );
