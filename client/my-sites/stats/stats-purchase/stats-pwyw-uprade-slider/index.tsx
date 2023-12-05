import formatCurrency from '@automattic/format-currency';
import TierUpgradeSlider from 'calypso/my-sites/stats/stats-purchase/tier-upgrade-slider';
import './styles.scss';

function getPWYWPlanTiers( minPrice: number, stepPrice: number ) {
	// From $0 to $20, in $1 increments.
	let tiers = [];
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

function getPWYWSteps() {
	return [
		{
			lhValue: '$0',
			rhValue: ':|',
		},
		{
			lhValue: '50 cents',
			rhValue: ':|',
		},
		{
			lhValue: '$1',
			rhValue: ':|',
		},
		{
			lhValue: '$1.50',
			rhValue: ':|',
		},
		{
			lhValue: '$2',
			rhValue: ':)',
		},
		{
			lhValue: '$5',
			rhValue: ':>',
		},
	];
}

function StatsPWYWUpgradeSlider() {
	const strings = {
		limits: 'Your monthly contribution',
		price: 'Thank you!',
		strategy: 'The average person pays $5 per month, billed yearly',
	};
	// TODO: Set up tiers/steps for slider.
	const smallSteps = true;
	const steps = smallSteps ? getPWYWPlanTiers( 0, 50 ) : getPWYWSteps();
	const handleSliderChanged = () => {
		console.log( 'handleSliderChanged' );
	};
	const marks = [ 0, steps.length - 1 ];
	return (
		<TierUpgradeSlider
			className="stats-pwyw-upgrade-slider"
			uiStrings={ strings }
			steps={ steps }
			initialValue={ ( steps.length - 1 ) / 2 }
			onSliderChange={ handleSliderChanged }
			marks={ marks }
		/>
	);
}

export default StatsPWYWUpgradeSlider;
