import { action } from '@storybook/addon-actions';
import HorizontalBarList from '../.';
import HorizontalBarListItem from '../horizontal-bar-grid-item';
// import { postsData } from './sampleData';
import './stories.scss';

export default { title: 'Horizontal bar list' };

const handleClick = action( 'click' );

const data = [
	{
		label: 'Home page',
		value: 1000,
	},
	{
		label: 'The Lord of the Rings',
		value: 789,
	},
	{
		label: 'The Dark Knoght Trilogy',
		value: 512,
	},
	{
		label: 'The Ultimate Matrix Collection',
		value: 256,
	},
	{
		label: 'Ghost In The Shell',
		value: 110,
	},
	{
		label: 'Akira',
		value: 10,
	},
];

const HorizontalBarListVariations = ( props ) => {
	const testData = props.data || data;

	const barMaxValue = testData[ 0 ]?.value;

	return (
		<div style={ { width: '500px' } }>
			<HorizontalBarList data={ testData } onClick={ handleClick }>
				{ testData.map( ( item, idx ) => {
					const variationProps = {
						hasIndicator: props.hasIndicator && idx % 3, // omit every 3rd item from being indicated
						onClick: props.onClick || null,
					};

					return (
						<HorizontalBarListItem
							key={ item?.id || idx }
							data={ item }
							maxValue={ barMaxValue }
							{ ...variationProps }
						/>
					);
				} ) }
			</HorizontalBarList>
		</div>
	);
};

export const Default = () => <HorizontalBarListVariations />;
export const Indicated = () => <HorizontalBarListVariations hasIndicator />;
export const WithClick = () => (
	// eslint-disable-next-line no-console
	<HorizontalBarListVariations onClick={ () => console.log( 'I was clicked!' ) } />
);
