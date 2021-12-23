import { Animate, Notice } from '@wordpress/components';

const AnimateExample = () => (
	<Animate type="appear">
		{ ( { className } ) => (
			<Notice className={ className } status="success">
				<p>Loading animation</p>
			</Notice>
		) }
	</Animate>
);

export default AnimateExample;
