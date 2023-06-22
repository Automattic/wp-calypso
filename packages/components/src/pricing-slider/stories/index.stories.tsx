import { useState } from 'react';
import PricingSlider from '../index';
import type { RenderThumbFunction } from '../types';
import type { StoryFn, Meta } from '@storybook/react';

export default {
	title: 'packages/components/Pricing Slider',
	component: PricingSlider,
} as Meta< typeof PricingSlider >;

const StoryContainer = ( { children }: { children: React.ReactNode } ) => (
	<div style={ { padding: '10vh 20vw' } }>{ children }</div>
);

// Export additional stories using pre-defined values
const Template: StoryFn< typeof PricingSlider > = ( args ) => (
	<StoryContainer>
		<PricingSlider { ...args } />
	</StoryContainer>
);

// Export Default story
export const _default = Template.bind( {} );

// Export additional stories using chaning values
const TemplateWithChangingValue: StoryFn< typeof PricingSlider > = ( args ) => {
	const [ value, setValue ] = useState( 10 );
	const [ endValue, setEndValue ] = useState( 10 );
	const renderThumb = ( ( props, state ) => {
		return (
			<div { ...props }>
				{ state.valueNow } - { state.valueNow % 2 === 0 ? 'Even' : 'Odd' }
			</div>
		);
	} ) as RenderThumbFunction;

	return (
		<StoryContainer>
			<PricingSlider
				{ ...args }
				value={ value }
				onChange={ setValue }
				onAfterChange={ setEndValue }
				renderThumb={ renderThumb } // eslint-disable-line react/jsx-no-bind
			/>
			<div>{ `Value on changing: ${ value }` }</div>
			<div>{ `Value on change ends: ${ endValue }` }</div>
		</StoryContainer>
	);
};

// Export With Default Value story
export const WithDefaultValue = TemplateWithChangingValue.bind( {} );
