/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import ProgressBar from 'components/progress-bar';

const ALERT_PERCENT = 80;
const WARN_PERCENT = 60;

const ARBITRARY_MAX_BYTES = 23264406187; //~21.6 GB

export default React.createClass( {

	displayName: 'PlanStorageBar',

	propTypes: {
		sitePlanName: React.PropTypes.string.isRequired,
		mediaStorage: React.PropTypes.object,
		onClick: React.PropTypes.func,
		className: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			onClick: noop
		}
	},

	render() {
		if ( ! this.props.mediaStorage || this.props.mediaStorage.max_storage_bytes === -1 ) {
			return null;
		}
		const percent = Math.min( this.props.mediaStorage.storage_used_bytes / this.props.mediaStorage.max_storage_bytes * 1000 ) / 10;
		const renderPercent = Math.min(
			Math.round( this.props.mediaStorage.storage_used_bytes / ARBITRARY_MAX_BYTES * 1000 ) / 10,
			100 );
		const classes = classNames( this.props.className, 'plan-storage-bar', {
			'is-alert': percent > ALERT_PERCENT,
			'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT
		} );
		const hasPremium = this.props.sitePlanName === 'Premium';
		const hasFree = this.props.sitePlanName === 'Free';
		return (
			<ProgressBar
				className={ classes }
				value={ renderPercent }
				total={ 100 } >
				<span className="plan-storage-bar__tick is-free">
					<span className="plan-storage-bar__tick-shadow" />
				</span>
				<span className="plan-storage-bar__tick is-premium">
					<span className="plan-storage-bar__tick-shadow" />
				</span>
				<div>
					<div className="plan-storage-bar__label is-free">
						{ hasFree ? this.translate( 'Free (Current Plan)' ) : this.translate( 'Free' ) }
						<p>
							{ this.translate( '3GB space' ) }
						</p>
					</div>
					<div className="plan-storage-bar__label is-premium">
						{ hasPremium ? this.translate( 'Premium (Current Plan)' ) : this.translate( 'Premium' ) }
						<p>
							{ this.translate( '13GB space' ) }
						</p>
					</div>
				</div>
			</ProgressBar>
		);
	}
} );
