/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import filesize from 'filesize';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import ProgressBar from 'components/progress-bar';

const ALERT_PERCENT = 80;
const WARN_PERCENT = 60;

class PlanStorageBar extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		sitePlanName: PropTypes.string.isRequired,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		onClick: noop
	};

	render() {
		const {
			className,
			mediaStorage,
			translate,
			onClick
		} = this.props;

		if ( ! mediaStorage || mediaStorage.max_storage_bytes === -1 ) {
			return null;
		}
		const percent = Math.min(
			Math.round( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes * 1000 ) / 10,
		100 );

		const classes = classNames( className, 'plan-storage__bar', {
			'is-alert': percent > ALERT_PERCENT,
			'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT
		} );

		const max = filesize( mediaStorage.max_storage_bytes );

		return (
			<div className={ classes } onClick={ onClick }>
				<span className="plan-storage__storage-label" >
					{ translate( '%(percent)f%% of %(max)s used', {
						args: {
							percent: percent,
							max: max
						}
					} ) }
				</span>

				<ProgressBar
					className="plan-storage__bar"
					value={ percent }
					total={ 100 }
					compact={ true } />

				{ this.props.children }
			</div>
		);
	}
}

export default localize( PlanStorageBar );
