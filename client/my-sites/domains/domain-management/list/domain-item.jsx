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

class DomainItem extends PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		showSite: PropTypes.bool,
		showCheckbox: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onAddEmailClick: PropTypes.func.isRequired,
		onToggle: PropTypes.func,
	};

	static defaultProps = {
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

	render() {
		const { domain, showSite, showCheckbox, translate } = this.props;

		const iconClassName = 'card__link-indicator';

		return (
			<CompactCard className="domain-item" onClick={ this.handleClick }>
				<Gridicon className={ iconClassName } icon="chevron-right" />
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
						<DomainNotice status="info" text={ translate( 'Activating domain' ) } />
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
					<DomainNotice
						status="info"
						text={ translate( 'Activating domain' ) }
						className="domain-item__mobile-notice"
					/>
				</div>
				<div className="domain-item__transfer-lock">
					<Gridicon size={ 18 } icon="checkmark" />
				</div>
				<div className="domain-item__privacy">
					<Gridicon size={ 18 } icon="checkmark" />
				</div>
				<div className="domain-item__auto-renew">
					<Gridicon size={ 18 } icon="minus" />
				</div>
				<div className="domain-item__email">
					<Button onClick={ this.addEmailClick }>{ translate( 'Add' ) }</Button>
				</div>
			</CompactCard>
		);
	}
}

export default localize( DomainItem );
