/**
 * External dependencies.
 */
import { Icon } from '@wordpress/components';

const JanitorialListBullet = ( { name, updateSelected, isSelected, canEdit } ) => {
	const onClick = () => updateSelected( name );

	return (
		<span
			className={ 'janitorial-state-widget-bullet ' + ( canEdit ? 'can-edit' : '' ) }
			onClick={ canEdit ? onClick : undefined }
		>
			<Icon icon={ isSelected ? 'arrow-right-alt2' : 'arrow-right' } />
		</span>
	);
};

export default JanitorialListBullet;
