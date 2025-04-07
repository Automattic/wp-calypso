import { formatCurrency, useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TierUpgradeSlider from 'calypso/my-sites/stats/stats-purchase/tier-upgrade-slider';
import { StatsPWYWSliderSettings } from 'calypso/my-sites/stats/stats-purchase/types';
import './styles.scss';

function useTranslatedStrings( defaultAveragePayment: number, currencyCode: string ) {
	const translate = useTranslate();
	const limits = translate( 'Your monthly contribution', {
		comment: 'Heading for Stats PWYW Upgrade slider. The monthly payment amount.',
	} ) as string;
	const price = translate( 'Thank you!', {
		comment: 'Heading for Stats PWYW Upgrade slider. The thank you message.',
	} ) as string;
	const strategy = translate( 'The average person pays %(value)s per month, billed yearly', {
		comment: 'Stats PWYW Upgrade slider message. The billing strategy.',
		args: {
			value: formatCurrency( defaultAveragePayment, currencyCode, { stripZeros: true } ),
		},
	} ) as string;

	return {
		limits,
		price,
		strategy,
	};
}

function emojiForStep( index: number, uiEmojiHeartTier: number, uiImageCelebrationTier: number ) {
	if ( index === 0 ) {
		return '';
	}
	// Smiling face emoji.
	if ( index < uiEmojiHeartTier ) {
		return String.fromCodePoint( 0x1f60a );
	}
	// Heart emoji.
	if ( index < uiImageCelebrationTier ) {
		return String.fromCodePoint( 0x2764, 0xfe0f );
	}
	// Big spender! Fire emoji.
	return String.fromCodePoint( 0x1f525 );
}

// Generate the range of available tiers based on the passed-in slider settings.
function generatePlanTiers( settings: StatsPWYWSliderSettings ) {
	const tiers = [];
	const steps = Math.floor( settings.maxSliderPrice / settings.sliderStepPrice );
	const disableFreeProduct = settings.minSliderPrice !== 0;
	for ( let i = 0; i <= steps; i++ ) {
		tiers.push( { value: i * settings.sliderStepPrice, id: i } );
	}
	if ( disableFreeProduct ) {
		return tiers.slice( 1 );
	}
	return tiers;
}

// Generate steps based on the provided tiers.
function generateSteps( tiers: any, currencyCode: string, settings: StatsPWYWSliderSettings ) {
	return tiers.map( ( tier: any ) => {
		return {
			raw: tier.value,
			mappedIndex: tier.id,
			lhValue: formatCurrency( tier.value, currencyCode ),
			rhValue: emojiForStep( tier.id, settings.uiEmojiHeartTier, settings.uiImageCelebrationTier ),
		};
	} );
}

type StatsPWYWUpgradeSliderProps = {
	settings: StatsPWYWSliderSettings;
	currencyCode: string;
	defaultStartingValue: number;
	analyticsEventName?: string;
	onSliderChange: ( index: number ) => void;
};

function StatsPWYWUpgradeSlider( {
	settings,
	currencyCode,
	analyticsEventName,
	defaultStartingValue,
	onSliderChange,
}: StatsPWYWUpgradeSliderProps ) {
	// Responsible for:
	// 1. Transforming the slider settings into tiers that the slider can use.
	// 2. Preparing the UI strings for the slider.
	// 3. Rendering the slider.
	// 4. Nofiying the parent component when the slider changes.

	// TODO: Figure out how to get the actual average payment from the API in the future.
	const defaultAveragePayment = defaultStartingValue * settings.sliderStepPrice;
	const uiStrings = useTranslatedStrings( defaultAveragePayment, currencyCode );

	// New steps generation.
	const tiers = generatePlanTiers( settings );
	const steps = generateSteps( tiers, currencyCode, settings );
	const marks = [ 0, steps.length - 1 ];

	// New mapped indexing for slider.
	// Implemented this way so as to not break parent logic.
	const disableFreeProduct = settings.minSliderPrice !== 0;
	const mappedDefaultIndex = disableFreeProduct ? defaultStartingValue - 1 : defaultStartingValue;

	// New slider change handler.
	const handleSliderChanged = ( index: number ) => {
		const mappedIndex = steps[ index ].mappedIndex;
		if ( analyticsEventName ) {
			recordTracksEvent( analyticsEventName, {
				step: mappedIndex,
				default_changed: mappedIndex !== mappedDefaultIndex,
			} );
		}
		onSliderChange( mappedIndex );
	};

	return (
		<TierUpgradeSlider
			className="stats-pwyw-upgrade-slider"
			uiStrings={ uiStrings }
			steps={ steps }
			initialValue={ mappedDefaultIndex }
			onSliderChange={ handleSliderChanged }
			marks={ marks }
		/>
	);
}

export default StatsPWYWUpgradeSlider;
