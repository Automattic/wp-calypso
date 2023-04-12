import { Icon, info } from '@wordpress/icons';
import BaseCard from '../base-card';
import CountCard from '../count-card';

export default { title: 'Highlight Card' };

export const WithBaseCard = () => (
	<BaseCard heading="Some Heading">
		<div>Some Body</div>
	</BaseCard>
);

export const WithCountCard = () => (
	<CountCard heading="Some Heading" icon={ <Icon icon={ info } /> } value="123" />
);
