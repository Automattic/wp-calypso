import { Placeholder, Notice } from '@wordpress/components';
import { more } from '@wordpress/icons';

const preview = <>{ 'A preview of my favorite block example' }</>;

const PlaceholderExample = () => (
	<Placeholder
		icon={ more }
		label="Placeholder example"
		instructions="Behold... a placeholder!"
		notices={
			<>
				<Notice>Notice A</Notice>
			</>
		}
		preview={ preview }
	/>
);

export default PlaceholderExample;
