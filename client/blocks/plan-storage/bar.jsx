import { planHasFeature, FEATURE_UNLIMITED_STORAGE } from '@automattic/calypso-products';
import { ProgressBar } from '@automattic/components';
import clsx from 'clsx';
import filesize from 'filesize';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

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

		if ( ! mediaStorage || mediaStorage.maxStorageBytes === -1 ) {
			return null;
		}

		const percent = Math.min(
			Math.round(
				( ( mediaStorage.storageUsedBytes / mediaStorage.maxStorageBytes ) * 1000 ) / 10
			),
			100
		);

		const classes = clsx( className, 'plan-storage__bar', {
			'is-alert': percent > ALERT_PERCENT,
			'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT,
		} );

		const max = filesize( mediaStorage.maxStorageBytes, { round: 0 } );

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
