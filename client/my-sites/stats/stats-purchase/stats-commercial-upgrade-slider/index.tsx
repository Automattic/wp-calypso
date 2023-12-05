import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TierUpgradeSlider from '../stats-purchase-tier-upgrade-slider';
import { StatsPlanTierUI } from '../types';
import useAvailableUpgradeTiers from '../use-available-upgrade-tiers';
import './styles.scss';

function useTranslatedStrings() {
	const translate = useTranslate();
	const limits = translate( 'Monthly site views limit', {
		comment: 'Heading for Stats Upgrade slider. The monthly views limit.',
	} );
	const price = translate( 'You will pay', {
		comment: 'Heading for Stats Upgrade slider. The monthly price.',
	} );
	const strategy = translate( 'Price per month, billed yearly', {
		comment: 'Stats Upgrade slider message. The billing strategy.',
	} );

	return {
		limits,
		price,
		strategy,
	};
}

function getStepsForTiers( tiers: StatsPlanTierUI[] ) {
	// TODO: Review tier values from API.
	// Should consider validating the inputs before displaying them.
	return tiers.map( ( tier ) => {
		// No transformation needed (yet).
		const price = tier.price;
		// Views can be a number or a string so address that.
		let views = '';
		if ( typeof tier.views === 'string' ) {
			views = tier.views;
		} else if ( typeof tier.views === 'number' ) {
			views = formatNumber( tier.views );
		}
		// Return the new step with string values.
		return {
			lhValue: views,
			rhValue: price,
		};
	} );
}

type StatsCommercialUpgradeSliderProps = {
	currencyCode: string;
	onSliderChange: ( quantity: number ) => void;
};

function StatsCommercialUpgradeSlider( {
	currencyCode,
	onSliderChange,
}: StatsCommercialUpgradeSliderProps ) {
	// 1. Prepare and translate UI strings.
	// 2. Fetch tier data.
	// 3. Transform data for slider.
	// 4. Render component parts.

	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const tiers = useAvailableUpgradeTiers( siteId );
	const uiStrings = useTranslatedStrings();

	// Special case for per-unit fees.
	// Determine this based on last tier in the list.
	// The translate() call returns a node so we need to set the type correctly.
	let perUnitFeeMessaging;
	const lastTier = tiers.at( -1 );
	const hasPerUnitFee = !! lastTier?.per_unit_fee;
	if ( hasPerUnitFee ) {
		const EXTENSION_THRESHOLD = 2; // in millions
		const perUnitFee = Number( lastTier?.per_unit_fee );
		perUnitFeeMessaging = translate(
			'This is the base price for %(views_extension_limit)s million monthly views; beyond that, you will be charged additional +%(extension_value)s per million views.',
			{
				args: {
					views_extension_limit: EXTENSION_THRESHOLD,
					extension_value: formatCurrency( perUnitFee, currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
			}
		);
		lastTier.views = `${ formatNumber( EXTENSION_THRESHOLD * 1000000 ) }+`;
	}

	const steps = getStepsForTiers( tiers );

	const handleSliderChanged = ( index: number ) => {
		onSliderChange( tiers[ index ]?.views as number );
	};

	return (
		<TierUpgradeSlider
			className="stats-commercial-upgrade-slider"
			uiStrings={ uiStrings }
			popupInfoString={ perUnitFeeMessaging }
			steps={ steps }
			onSliderChange={ handleSliderChanged }
		/>
	);
}

export default StatsCommercialUpgradeSlider;
