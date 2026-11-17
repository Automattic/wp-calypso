import { TERM_MONTHLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import * as React from 'react';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import type { Duration, DurationChangeCallback } from '../types';

import './style.scss';

interface FilterBarProps {
	showDurations?: boolean;
	duration?: Duration;
	onDurationChange?: DurationChangeCallback;
}

const PlansFilterBar: React.FC< FilterBarProps > = ( { duration, onDurationChange } ) => {
	const translate = useTranslate();

	const CALYPSO_MASTERBAR_HEIGHT = 47;
	const CLOUD_MASTERBAR_HEIGHT = 0;

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() || isConnectStore() ) {
			return CLOUD_MASTERBAR_HEIGHT;
		}

		return CALYPSO_MASTERBAR_HEIGHT;
	}, [] );
	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const [ durationChecked, setDurationChecked ] = useState( duration === TERM_ANNUALLY );
	useEffect( () => {
		const selectedDuration = durationChecked ? TERM_ANNUALLY : TERM_MONTHLY;
		onDurationChange?.( selectedDuration );
	}, [ onDurationChange, durationChecked ] );

	const outerDivProps = barRef ? { ref: barRef as React.RefObject< HTMLDivElement > } : {};

	return (
		<>
			<div className="plans-filter-bar__viewport-sentinel" { ...outerDivProps }></div>
			<div
				className={ clsx( 'plans-filter-bar', {
					sticky: hasCrossed,
				} ) }
			>
				<div className="plans-filter-bar__duration-toggle-wrapper">
					<div
						className={ clsx( 'plans-filter-bar__duration-toggle', {
							checked: durationChecked,
						} ) }
					>
						<span className="plans-filter-bar__toggle-off-label">
							{ translate( 'Bill monthly' ) }
						</span>
						<ToggleControl
							className="plans-filter-bar__toggle-control"
							checked={ durationChecked }
							onChange={ () => setDurationChecked( ( prevState ) => ! prevState ) }
							label={ undefined }
						/>
						<span className="plans-filter-bar__toggle-on-label">
							{ translate( 'Bill yearly' ) }
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default PlansFilterBar;
