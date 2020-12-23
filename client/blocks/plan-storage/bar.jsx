/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import filesize from 'filesize';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';
import { planHasFeature } from 'calypso/lib/plans';
import { FEATURE_UNLIMITED_STORAGE } from 'calypso/lib/plans/constants';

const ALERT_PERCENT = 80;
const WARN_PERCENT = 60;

export class PlanStorageBar extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		displayUpgradeLink: PropTypes.bool,
		sitePlanSlug: PropTypes.string.isRequired,
	};

	render() {
		const { className, displayUpgradeLink, mediaStorage, sitePlanSlug, translate } = this.props;

		if ( planHasFeature( sitePlanSlug, FEATURE_UNLIMITED_STORAGE ) ) {
			return null;
		}

		if ( ! mediaStorage || mediaStorage.max_storage_bytes === -1 ) {
			return null;
		}

		const percent = Math.min(
			Math.round( ( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes ) * 1000 ) /
				10,
			100
		);

		const classes = classNames( className, 'plan-storage__bar', {
			'is-alert': percent > ALERT_PERCENT,
			'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT,
		} );

		const max = filesize( mediaStorage.max_storage_bytes );

		return (
			<div className={ classes }>
				<ProgressBar value={ percent } total={ 100 } compact />

				<span className="plan-storage__storage-label">
					{ translate( '%(percent)f%% of %(max)s used', {
						args: {
							percent: percent,
							max: max,
						},
					} ) }
				</span>

				{ displayUpgradeLink && (
					<span className="plan-storage__storage-link">{ translate( 'Upgrade' ) }</span>
				) }

				{ this.props.children }
			</div>
		);
	}
}

export default localize( PlanStorageBar );
