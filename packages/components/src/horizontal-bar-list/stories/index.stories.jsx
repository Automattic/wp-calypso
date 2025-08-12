import { action } from '@storybook/addon-actions';
import { Icon, external } from '@wordpress/icons';
import HorizontalBarList from '../.';
import HorizontalBarListItem from '../horizontal-bar-grid-item';
import StatsCard from '../stats-card';

export default { title: 'Unaudited/Horizontal bar list' };

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
	const { leftSideItem, renderRightSideItem, footerAction } = props;
	const testData = props.data || data;

	const barMaxValue = testData[ 0 ]?.value;

	return (
		<div style={ { width: '500px', margin: '0 auto' } }>
			<StatsCard title="Posts & Pages" footerAction={ footerAction }>
				<HorizontalBarList data={ testData } onClick={ handleClick }>
					{ testData.map( ( item, idx ) => {
						const variationProps = {
							hasIndicator: props.hasIndicator && idx % 3, // omit every 3rd item from being indicated
							onClick: props.onClick || null,
							leftSideItem,
							renderRightSideItem,
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
			</StatsCard>
		</div>
	);
};

const ImageSample = () => {
	return <img src="https://placekitten.com/20/20" alt="sample" />;
};

//TODO: convert to a component for mixing and matching actions.
const RedirectSample = () => {
	return (
		<>
			<Icon icon={ external } size={ 18 } />
			<span>View</span>
		</>
	);
};

export const Default = () => <HorizontalBarListVariations />;
export const DefaultWithFooter = () => (
	<HorizontalBarListVariations
		footerAction={ { url: 'https://wordpress.com/', label: 'Show more' } }
	/>
);
export const Indicated = () => <HorizontalBarListVariations hasIndicator />;
export const WithClick = () => (
	// eslint-disable-next-line no-console
	<HorizontalBarListVariations onClick={ () => console.log( 'I was clicked!' ) } />
);
export const WithLeftItem = () => <HorizontalBarListVariations leftSideItem={ <ImageSample /> } />;
export const WithRightItem = () => (
	<HorizontalBarListVariations renderRightSideItem={ () => <RedirectSample /> } />
);
