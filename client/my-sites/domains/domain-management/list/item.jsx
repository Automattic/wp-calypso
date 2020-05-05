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
import { Button, CompactCard } from '@automattic/components';
import DomainPrimaryFlag from 'my-sites/domains/domain-management/components/domain/primary-flag';
import DomainTransferFlag from 'my-sites/domains/domain-management/components/domain/transfer-flag';
import Notice from 'components/notice';
import { type as domainTypes, gdprConsentStatus } from 'lib/domains/constants';
import Spinner from 'components/spinner';
import { withLocalizedMoment } from 'components/localized-moment';
import TrackComponentView from 'lib/analytics/track-component-view';

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
		shouldUpgradeToMakePrimary: PropTypes.bool,
		onUpgradeClick: PropTypes.func.isRequired,
	};

	static defaultProps = {
		shouldUpgradeToMakePrimary: false,
	};

	renderContent() {
		if ( this.props.enableSelection ) {
			const content = <label htmlFor={ this.getInputId() }>{ this.content() }</label>;

			if ( this.props.shouldUpgradeToMakePrimary ) {
				return (
					<div className="domain-management-list-item__content">
						{ content }
						{ this.upgradeToMakePrimary() }
					</div>
				);
			}

			return content;
		}

		return this.content();
	}

	render() {
		const { busy, enableSelection, shouldUpgradeToMakePrimary } = this.props;
		const cardClass = classNames( 'domain-management-list-item', {
			busy: busy || ( enableSelection && shouldUpgradeToMakePrimary ),
		} );
		const onClick = enableSelection && shouldUpgradeToMakePrimary ? null : this.handleClick;

		return (
			<CompactCard className={ cardClass } onClick={ onClick }>
				{ this.selectionRadio() }
				{ this.renderContent() }
			</CompactCard>
		);
	}

	upgradeToMakePrimary() {
		const { translate } = this.props;

		return (
			<div className="domain-management-list-item__upsell">
				<span>{ translate( 'Upgrade to a paid plan to make this your primary domain' ) }</span>
				<Button primary onClick={ this.props.onUpgradeClick }>
					{ translate( 'Upgrade' ) }
				</Button>
				<TrackComponentView eventName="calypso_domain_management_list_change_primary_upgrade_impression" />
			</div>
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
		if ( this.props.shouldUpgradeToMakePrimary && this.props.enableSelection ) {
			return;
		} else if ( this.props.enableSelection ) {
			this.props.onSelect( this.props.selectionIndex, this.props.domain );
		} else {
			this.props.onClick( this.props.domain );
		}
	};

	getInputId() {
		return `domain-management-list-item_radio-${ this.props.domain.name }`;
	}

	selectionRadio() {
		if ( ! this.props.enableSelection || this.props.shouldUpgradeToMakePrimary ) {
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
