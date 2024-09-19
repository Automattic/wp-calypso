import clsx from 'clsx';
import { memo } from 'react';

import './style.scss';

const ButtonGroup = ( { busy = false, children, className = '', primary = false } ) => {
	const buttonGroupClasses = clsx( 'button-group', className, {
		'is-busy': busy,
		'is-primary': primary,
	} );

	return (
		<span className={ buttonGroupClasses } role="group">
			{ children }
		</span>
	);
};

export default memo( ButtonGroup );
