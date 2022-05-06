import classNames from 'classnames';
import { memo } from 'react';

import './style.scss';

const ButtonGroup = ( { busy = false, children, className = '', primary = false } ) => {
	const buttonGroupClasses = classNames( 'button-group', className, {
		'is-busy': busy,
		'is-primary': primary,
	} );

	return (
		<span data-testid="button-group-id" className={ buttonGroupClasses }>
			{ children }
		</span>
	);
};

export default memo( ButtonGroup );
