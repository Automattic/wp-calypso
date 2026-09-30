import { planHasFeature, FEATURE_UNLIMITED_STORAGE } from '@automattic/calypso-products';
import { ProgressBar } from '@automattic/components';
import clsx from 'clsx';
import { getLocaleSlug, localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { getIntlLocale } from 'calypso/dashboard/utils/locale';
import { formatStorage, getStorageUsagePercent } from 'calypso/dashboard/utils/site-storage';

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

		const percent = getStorageUsagePercent( {
			storage_used_bytes: mediaStorage.storageUsedBytes,
			max_storage_bytes: mediaStorage.maxStorageBytes,
		} );

		const classes = clsx( className, 'plan-storage__bar', {
			'is-alert': percent > ALERT_PERCENT,
			'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT,
		} );

		const max = formatStorage( mediaStorage.maxStorageBytes, getIntlLocale( getLocaleSlug() ) );

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
