import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import FormLabel from 'calypso/components/forms/form-label';

const Security2faProgressItem = ( { icon, label, step } ) => (
	<div
		className={ classNames( 'security-2fa-progress__item', {
			'is-highlighted': step?.isHighlighted,
			'is-completed': step?.isCompleted,
		} ) }
	>
		<Gridicon icon={ icon } />
		<FormLabel>{ label } </FormLabel>
	</div>
);

export default Security2faProgressItem;
