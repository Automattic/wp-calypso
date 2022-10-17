import { action } from '@storybook/addon-actions';
import HorizontalBarList from '.';
import './stories.scss';

export default { title: 'Horizontal bar list' };

const helloWorld = `Hello World!`;
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

const HorizontalBarListVariations = ( props ) => (
	<div style={ { width: '800px' } }>
		<HorizontalBarList data={ data } onClick={ handleClick } { ...props }>
			{ helloWorld }
		</HorizontalBarList>
	</div>
);

export const Default = () => <HorizontalBarListVariations />;
