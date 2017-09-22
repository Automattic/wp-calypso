/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import Spinner from 'components/spinner';
import { type as domainTypes } from 'lib/domains/constants';
import DomainPrimaryFlag from 'my-sites/domains/domain-management/components/domain/primary-flag';

class ListItem extends React.PureComponent {
	static propTypes = {
		busy: PropTypes.bool,
		busyMessage: PropTypes.string,
		domain: PropTypes.object.isRequired,
		enableSelection: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
		selectionIndex: PropTypes.number,
		isSelected: PropTypes.bool
	};

	render() {
		const cardClass = classNames( 'domain-management-list-item', {
			busy: this.props.busy
		} );

		return (
			<CompactCard className={ cardClass }>
				{ this.selectionRadio() }
				{ this.props.enableSelection && <label htmlFor={ this.getInputId() }>{ this.content() }</label> || this.content() }
			</CompactCard>
		);
	}

	content() {
		return (
			<div className="domain-management-list-item__link" onClick={ this.handleClick }>
				{ this.icon() }
				<div className="domain-management-list-item__title">
					{ this.props.domain.name }
				</div>
				<span className="domain-management-list-item__meta">
					<span className="domain-management-list-item__type">{ this.getDomainTypeText() }</span>
					{ this.props.domain.type !== 'WPCOM' && this.showDomainExpirationWarning( this.props.domain ) }
					<DomainPrimaryFlag domain={ this.props.domain } />
				</span>
				{ this.busyMessage() }
			</div>
		);
	}

	busyMessage() {
		if ( this.props.busy && this.props.busyMessage ) {
			return <div className="domain-management-list-item__busy-message">{ this.props.busyMessage }</div>;
		}
	}

	icon() {
		if ( this.props.busy ) {
			return <Spinner className="domain-management-list-item__spinner" size={ 20 } />;
		}

		if ( this.props.enableSelection ) {
			return null;
		}
		return <Gridicon className="card__link-indicator" icon="chevron-right" />;
	}

	handleClick = () => {
		if ( this.props.enableSelection ) {
			return;
		}
		this.props.onClick( this.props.domain );
	};

	handleSelect = () => {
		this.props.onSelect( this.props.selectionIndex, this.props.domain );
	};

	getInputId() {
		return `domain-management-list-item_radio-${ this.props.domain.name }`;
	}

	selectionRadio() {
		if ( ! this.props.enableSelection ) {
			return null;
		}

		return <input
			id={ this.getInputId() }
			className="domain-management-list-item__radio"
			type="radio"
			checked={ this.props.isSelected }
			onChange={ this.handleSelect }
		/>;
	}

	showDomainExpirationWarning( domain ) {
		const { translate } = this.props;

		if ( domain.expired ) {
			return (
				<Notice isCompact status="is-error" icon="spam">
					{ translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: domain.expirationMoment.fromNow()
						},
						context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"'
					} ) }
				</Notice>
			);
		}

		if ( domain.expirationMoment && domain.expirationMoment < this.props.moment().add( 30, 'days' ) ) {
			return (
				<Notice isCompact status="is-error" icon="spam">
					{ translate( 'Expires %(timeUntilExpiry)s', {
						args: {
							timeUntilExpiry: domain.expirationMoment.fromNow()
						},
						context: 'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"'
					} ) }
				</Notice>
			);
		}
	}

	getDomainTypeText() {
		const { domain, translate } = this.props;

		switch ( domain.type ) {
			case domainTypes.MAPPED:
				return translate( 'Mapped Domain' );

			case domainTypes.REGISTERED:
				return translate( 'Registered Domain' );

			case domainTypes.SITE_REDIRECT:
				return translate( 'Site Redirect' );

			case domainTypes.WPCOM:
				return translate( 'Included with Site' );
		}
	}
}

export default localize( ListItem );
