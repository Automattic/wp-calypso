/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const ButtonGroup = ( { busy, children, className, primary } ) => {
	const buttonGroupClasses = classNames( 'button-group', className, {
		'is-busy': busy,
		'is-primary': primary,
	} );

	return <span className={ buttonGroupClasses }>{ children }</span>;
};

export default React.memo( ButtonGroup );
