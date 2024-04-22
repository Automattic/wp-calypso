import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	EXTENSION_THRESHOLD_IN_MILLION,
	default as useAvailableUpgradeTiers,
} from 'calypso/my-sites/stats/hooks/use-available-upgrade-tiers';
import TierUpgradeSlider from 'calypso/my-sites/stats/stats-purchase/tier-upgrade-slider';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { StatsPlanTierUI } from '../types';

import './styles.scss';

const INITIAL_FIRST_TIER_VIEWS_LIMIT = 10000;

function useTranslatedStrings() {
	const translate = useTranslate();
	const limits = translate( 'Monthly views limit', {
		comment: 'Heading for Stats Upgrade slider. The monthly views limit.',
	} ) as string;
	const price = translate( 'You pay', {
		comment: 'Heading for Stats Upgrade slider. The monthly price.',
	} ) as string;
	const strategy = translate( 'Price per month, billed yearly', {
		comment: 'Stats Upgrade slider message. The billing strategy.',
	} ) as string;

	return {
		limits,
		price,
		strategy,
	};
}

function getStepsForTiers( tiers: StatsPlanTierUI[], currencyCode: string ) {
	// Should consider validating the inputs before displaying them.
	return tiers.map( ( tier ) => {
		// No transformation needed (yet).
		let price = '';
		if ( typeof tier.price === 'string' ) {
			price = tier.price;
		}

		const tierUpgradePricePerMonth = ( tier.upgrade_price || 0 ) / 12;

		// Return the new step with string values.
		return {
			lhValue: formatNumber( tier.views ),
			rhValue: price,
			originalPrice: tier.price,
			upgradePrice: tierUpgradePricePerMonth
				? formatCurrency( tierUpgradePricePerMonth, currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
				  } )
				: '',
			tierViews: tier.views,
		};
	} );
}

type StatsCommercialUpgradeSliderProps = {
	currencyCode: string;
	analyticsEventName?: string;
	onSliderChange: ( quantity: number ) => void;
};

const getTierQuentity = ( tiers: StatsPlanTierUI, isTierUpgradeSliderEnabled: boolean ) => {
	if ( isTierUpgradeSliderEnabled ) {
		if ( tiers?.views === null && tiers?.transform_quantity_divide_by ) {
			// handle extension an tier by muliplying the limit of the highest tier
			return EXTENSION_THRESHOLD_IN_MILLION * tiers.transform_quantity_divide_by; // TODO: this will use a dynamic multiplier (#85246)
		}
		return tiers?.views;
	}
	return 0;
};

function StatsCommercialUpgradeSlider( {
	currencyCode,
	analyticsEventName,
	onSliderChange,
}: StatsCommercialUpgradeSliderProps ) {
	// Responsible for:
	// 1. Fetching the tiers from the API.
	// 2. Transforming the tiers into a format that the slider can use.
	// 3. Preparing the UI strings for the slider.
	// 4. Rendering the slider.
	// 5. Nofiying the parent component when the slider changes.

	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const tiers = useAvailableUpgradeTiers( siteId );
	const uiStrings = useTranslatedStrings();

	// Show a message with a tooltip for the first tier when it's over 10k views,
	// which means the user is extending the limit based on the purchased tier or current usage.
	let firstTierInfo;
	if ( tiers[ 0 ].views && tiers[ 0 ].views > INITIAL_FIRST_TIER_VIEWS_LIMIT ) {
		firstTierInfo = translate(
			// TBD: This message should be updated with a more appropriate or detailed copy.
			'The purchasable views limit starts from your purchased tier or current usage.'
		);
	}

	// Special case for per-unit fees.
	// Determine this based on last tier in the list.
	// The translate() call returns a node so we need to set the type correctly.
	let perUnitFeeMessaging;
	const lastTier = tiers[ tiers.length - 1 ];
	const hasPerUnitFee = !! lastTier?.per_unit_fee;
	if ( hasPerUnitFee ) {
		// The price is yearly for yearly plans, so we need to divide by 12.
		const perUnitFee = Number( lastTier?.per_unit_fee ) / 12;

		perUnitFeeMessaging = translate(
			"Beyond 1 million, we'll charge an extra %(extension_value)s per million views per month.", // TODO: we'll need a 'learn more' here.
			{
				args: {
					extension_value: formatCurrency( perUnitFee, currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
			}
		) as string;
	}

	// Transform the tiers into a format that the slider can use.
	const steps = getStepsForTiers( tiers, currencyCode );

	const handleSliderChanged = ( index: number ) => {
		const quantity = getTierQuentity( tiers[ index ], true );

		if ( analyticsEventName ) {
			recordTracksEvent( analyticsEventName, {
				tier_views: quantity,
				default_changed: index !== 0, // 0 is the default initialVlaue value for <TierUpgradeSlider />
			} );
		}

		onSliderChange( quantity as number );
	};

	useEffect( () => {
		// Update fetched tier quantity of the first step back to the parent component for checkout.
		const firstStepQuantity = getTierQuentity( tiers[ 0 ], true );
		onSliderChange( firstStepQuantity as number );
	}, [ JSON.stringify( tiers ), onSliderChange ] );

	return (
		<TierUpgradeSlider
			className="stats-commercial-upgrade-slider"
			uiStrings={ uiStrings }
			firstTierInfo={ firstTierInfo }
			popupInfoString={ perUnitFeeMessaging }
			steps={ steps }
			onSliderChange={ handleSliderChanged }
			marks={ true }
		/>
	);
}

export { StatsCommercialUpgradeSlider as default, StatsCommercialUpgradeSlider, getTierQuentity };
