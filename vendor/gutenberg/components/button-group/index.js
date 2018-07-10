/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

function ButtonGroup( { className, ...props } ) {
	const classes = classnames( 'components-button-group', className );

	return (
		<div { ...props } className={ classes } role="group" />
	);
}

export default ButtonGroup;
