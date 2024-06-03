import { FormLabel, Gridicon } from '@automattic/components';
import clsx from 'clsx';

const Security2faProgressItem = ( { icon, label, step } ) => (
	<div
		className={ clsx( 'security-2fa-progress__item', {
			'is-highlighted': step?.isHighlighted,
			'is-completed': step?.isCompleted,
		} ) }
	>
		<Gridicon icon={ icon } />
		<FormLabel>{ label } </FormLabel>
	</div>
);

export default Security2faProgressItem;
