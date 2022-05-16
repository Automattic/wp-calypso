import { action } from '@storybook/addon-actions';
import ResponsiveToolbarGroup from '.';

import '@wordpress/components/build-style/style.css';

export default { title: 'ResponsiveToolbarGroup' };

export const Normal = () => (
	<div style={ { width: '100%' } }>
		<ResponsiveToolbarGroup onClick={ action( 'onClick' ) }>
			<span> Item #1</span>
			<span> Item #2</span>
			<span> Item #3</span>
			<span> Item #4</span>
			<span> Item #5</span>
			<span> Item #6</span>
		</ResponsiveToolbarGroup>
	</div>
);

export const NormalWithSelectedIndex = () => (
	<div style={ { width: '100%' } }>
		<ResponsiveToolbarGroup onClick={ action( 'onClick' ) } initialActiveIndex={ 4 }>
			<span> Item #1</span>
			<span> Item #2</span>
			<span> Item #3</span>
			<span> Item #4</span>
			<span> Item #5</span>
			<span> Item #6</span>
		</ResponsiveToolbarGroup>
	</div>
);

export const WithGrouped = () => (
	<div style={ { width: '30%' } }>
		<ResponsiveToolbarGroup onClick={ action( 'onClick' ) }>
			<span> Item #1</span>
			<span> Item #2</span>
			<span> Item #3</span>
			<span> Item #4</span>
			<span> Item #5</span>
			<span> Item #6</span>
			<span> Item #7</span>
			<span> Item #8</span>
			<span> Item #9</span>
			<span> Item #10</span>
		</ResponsiveToolbarGroup>
	</div>
);

export const WithGroupedAndSelectedIndex = () => (
	<div style={ { width: '30%' } }>
		<ResponsiveToolbarGroup onClick={ action( 'onClick' ) } initialActiveIndex={ 8 }>
			<span> Item #1</span>
			<span> Item #2</span>
			<span> Item #3</span>
			<span> Item #4</span>
			<span> Item #5</span>
			<span> Item #6</span>
			<span> Item #7</span>
			<span> Item #8</span>
			<span> Item #9</span>
			<span> Item #10</span>
		</ResponsiveToolbarGroup>
	</div>
);
