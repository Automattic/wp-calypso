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

class DomainItem extends PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
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
			<div className="domain-item__options">
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

	render() {
		const { domain, showSite, showCheckbox, translate } = this.props;

		return (
			<CompactCard className="domain-item" onClick={ this.handleClick }>
				{ showCheckbox && (
					<FormCheckbox
						className="domain-item__checkbox"
						onChange={ this.onToggle }
						onClick={ this.stopPropagation }
					/>
				) }
				<div className="domain-item__link">
					<div className="domain-item__status">
						<div className="domain-item__title">{ domain.domain }</div>
						<DomainNotice status="info" text="Activating domain" />
					</div>
					{ showSite && (
						<div className="domain-item__meta">
							{ translate( 'Site: %(siteURL)s', {
								args: {
									siteURL: 'todo',
								},
								comment: '%(siteURL)s is the URL of the site',
							} ) }
						</div>
					) }
				</div>
				<div className="domain-item__transfer-lock">
					<Gridicon className="domain-item__icon" size={ 18 } icon="checkmark" />
				</div>
				<div className="domain-item__privacy">
					<Gridicon className="domain-item__icon" size={ 18 } icon="checkmark" />
				</div>
				<div className="domain-item__auto-renew">
					<Gridicon className="domain-item__icon" size={ 18 } icon="minus" />
				</div>
				<div className="domain-item__email">
					<Button compact onClick={ this.addEmailClick }>
						{ translate( 'Add', {
							context: 'Button label',
							comment: '"Add" as in "Add an email"',
						} ) }
					</Button>
				</div>
				{ this.renderOptionsButton() }
			</CompactCard>
		);
	}
}

export default localize( DomainItem );
