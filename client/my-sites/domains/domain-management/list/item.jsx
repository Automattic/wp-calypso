/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import DomainPrimaryFlag from 'my-sites/domains/domain-management/components/domain/primary-flag';
import DomainTransferFlag from 'my-sites/domains/domain-management/components/domain/transfer-flag';
import Notice from 'components/notice';
import { type as domainTypes, gdprConsentStatus } from 'lib/domains/constants';
import Spinner from 'components/spinner';
import { withLocalizedMoment } from 'components/localized-moment';

class ListItem extends React.PureComponent {
	static propTypes = {
		busy: PropTypes.bool,
		busyMessage: PropTypes.string,
		domain: PropTypes.object.isRequired,
		enableSelection: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
		selectionIndex: PropTypes.number,
		isSelected: PropTypes.bool,
	};

	render() {
		const cardClass = classNames( 'domain-management-list-item', {
			busy: this.props.busy,
		} );

		return (
			<CompactCard className={ cardClass } onClick={ this.handleClick }>
				{ this.selectionRadio() }
				{ this.content() }
			</CompactCard>
		);
	}

	content() {
		return (
			<div className="domain-management-list-item__link">
				{ this.icon() }
				<div className="domain-management-list-item__title">{ this.props.domain.name }</div>
				<span className="domain-management-list-item__meta">
					<span className="domain-management-list-item__type">{ this.getDomainTypeText() }</span>
					{ this.props.domain.type !== 'WPCOM' &&
						this.showDomainExpirationWarning( this.props.domain ) }
					{ this.showGdprConsentPending( this.props.domain ) }
					<DomainPrimaryFlag domain={ this.props.domain } />
					<DomainTransferFlag domain={ this.props.domain } />
				</span>
				{ this.busyMessage() }
			</div>
		);
	}

	busyMessage() {
		if ( this.props.busy && this.props.busyMessage ) {
			return (
				<div className="domain-management-list-item__busy-message">{ this.props.busyMessage }</div>
			);
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
			this.props.onSelect( this.props.selectionIndex, this.props.domain );
		} else {
			this.props.onClick( this.props.domain );
		}
	};

	getInputId() {
		return `domain-management-list-item_radio-${ this.props.domain.name }`;
	}

	selectionRadio() {
		if ( ! this.props.enableSelection ) {
			return null;
		}

		return (
			<input
				id={ this.getInputId() }
				className="domain-management-list-item__radio"
				type="radio"
				checked={ this.props.isSelected }
				onChange={ noop }
			/>
		);
	}

	showDomainExpirationWarning( domain ) {
		const { translate, moment } = this.props;

		if ( domain.expired ) {
			return (
				<Notice isCompact status="is-error" icon="spam">
					{ translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: moment( domain.expiry ).fromNow(),
						},
						context:
							'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
					} ) }
				</Notice>
			);
		}

		if ( domain.expiry && moment( domain.expiry ) < this.props.moment().add( 30, 'days' ) ) {
			return (
				<Notice isCompact status="is-error" icon="spam">
					{ translate( 'Expires %(timeUntilExpiry)s', {
						args: {
							timeUntilExpiry: moment( domain.expiry ).fromNow(),
						},
						context:
							'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
					} ) }
				</Notice>
			);
		}
	}

	showGdprConsentPending( domain ) {
		const { translate } = this.props;
		if (
			domain.gdprConsentStatus &&
			gdprConsentStatus.PENDING_ASYNC === domain.gdprConsentStatus
		) {
			return (
				<Notice isCompact status="is-error" icon="spam">
					{ translate( 'Action Required' ) }
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

			case domainTypes.TRANSFER:
				return translate( 'Incoming Domain Transfer' );

			case domainTypes.WPCOM:
				return translate( 'Included with Site' );
		}
	}
}

export default localize( withLocalizedMoment( ListItem ) );
