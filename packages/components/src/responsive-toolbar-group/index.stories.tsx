import ResponsiveToolbarGroup from '.';

import '@wordpress/components/build-style/style.css';

export default { title: 'ResponsiveToolbarGroup' };

export const Normal = () => (
	<div style={ { width: '50%' } }>
		<ResponsiveToolbarGroup>
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
