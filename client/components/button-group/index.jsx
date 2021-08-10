import classNames from 'classnames';
import React from 'react';

import './style.scss';

const ButtonGroup = ( { busy, children, className, primary } ) => {
	const buttonGroupClasses = classNames( 'button-group', className, {
		'is-busy': busy,
		'is-primary': primary,
	} );

	return <span className={ buttonGroupClasses }>{ children }</span>;
};

export default React.memo( ButtonGroup );
