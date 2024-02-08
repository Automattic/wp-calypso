import classNames from 'classnames';
import { useState } from 'react';

const Menupop = ( { id, children, className } ) => {
	const [ hover, setHover ] = useState( false );

	const addHover = () => setHover( true );
	const removeHover = () => setHover( false );

	return (
		<li
			id={ id }
			className={ classNames( 'menupop', className, { hover: hover } ) }
			onMouseOver={ addHover }
			onFocus={ addHover }
			onMouseOut={ removeHover }
			onBlur={ removeHover }
		>
			{ children }
		</li>
	);
};

export default Menupop;
