import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import TierUpgradeSlider from 'calypso/my-sites/stats/stats-purchase/tier-upgrade-slider';
import { StatsPWYWSliderSettings } from 'calypso/my-sites/stats/stats-purchase/types';
import './styles.scss';

// TODO: Remove test data.
// Currently used as a fallback if no plan info is provided.
// Better approach is to require plan info and do some form of validation on it.
function getPWYWPlanTiers( minPrice: number, stepPrice: number ) {
	// From $0 to $20, in $1 increments.
	let tiers: any[] = [];
	for ( let i = 0; i <= 28; i++ ) {
		tiers.push( {
			price: formatCurrency( ( minPrice + i * stepPrice ) / 100, 'USD' ),
			raw: minPrice + i * stepPrice,
		} );
	}
	tiers = tiers.map( ( tier ) => {
		const emoji = tier.raw < 500 ? ':|' : ':)';
		return {
			...tier,
			lhValue: tier.price,
			rhValue: emoji,
		};
	} );
	return tiers;
}

function useTranslatedStrings() {
	const translate = useTranslate();
	const limits = translate( 'Your monthly contribution', {
		comment: 'Heading for Stats PWYW Upgrade slider. The monthly payment amount.',
	} ) as string;
	const price = translate( 'Thank you!', {
		comment: 'Heading for Stats PWYW Upgrade slider. The thank you message.',
	} ) as string;
	const defaultAverageAmount = 7; // Matches the default set in the slider.
	const strategy = translate( 'The average person pays %(value)s per month, billed yearly', {
		comment: 'Stats PWYW Upgrade slider message. The billing strategy.',
		args: {
			value: formatCurrency( defaultAverageAmount, '', { stripZeros: true } ),
		},
	} ) as string;

	return {
		limits,
		price,
		strategy,
	};
}

function emojiForStep( index: number ) {
	const uiEmojiHeartTier = 14;
	const uiImageCelebrationTier = 23;
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

// Takes a StatsPWYWSliderSettings object and returns an array of slider steps.
// The slider wants string values for the left and right labels.
function stepsFromSettings( settings: StatsPWYWSliderSettings, currencyCode: string ) {
	// Pull tier strategy from settings.
	// We ignore the emoji thresholds and use our own.
	const { sliderStepPrice, minSliderPrice, maxSliderPrice } = settings;
	// Set up our slider steps based on above strategy.
	const sliderSteps = [];
	const maxSliderValue = Math.floor( maxSliderPrice / sliderStepPrice );
	const minSliderValue = Math.round( minSliderPrice / sliderStepPrice );
	for ( let i = minSliderValue; i <= maxSliderValue; i++ ) {
		const rawValue = minSliderPrice + i * sliderStepPrice;
		sliderSteps.push( {
			raw: rawValue,
			lhValue: formatCurrency( rawValue, currencyCode ),
			rhValue: emojiForStep( i ),
		} );
	}
	return sliderSteps;
}

type StatsPWYWUpgradeSliderProps = {
	settings?: StatsPWYWSliderSettings;
	currencyCode?: string;
	onSliderChange: ( index: number ) => void;
};

function StatsPWYWUpgradeSlider( {
	settings,
	currencyCode,
	onSliderChange,
}: StatsPWYWUpgradeSliderProps ) {
	// Responsible for:
	// 1. Transforming the slider settings into tiers that the slider can use.
	// 2. Preparing the UI strings for the slider.
	// 3. Rendering the slider.
	// 4. Nofiying the parent component when the slider changes.

	const uiStrings = useTranslatedStrings();

	let steps = getPWYWPlanTiers( 0, 50 );
	if ( settings !== undefined ) {
		steps = stepsFromSettings( settings, currencyCode || '' );
	}
	const marks = [ 0, steps.length - 1 ];

	const handleSliderChanged = ( index: number ) => {
		onSliderChange( index );
	};

	return (
		<TierUpgradeSlider
			className="stats-pwyw-upgrade-slider"
			uiStrings={ uiStrings }
			steps={ steps }
			initialValue={ ( steps.length - 1 ) / 2 }
			onSliderChange={ handleSliderChanged }
			marks={ marks }
		/>
	);
}

export default StatsPWYWUpgradeSlider;
