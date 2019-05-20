/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
	iconsThatNeedOffset,
	iconsThatNeedOffsetX,
	iconsThatNeedOffsetY,
} from 'gridicons/dist/util/icons-offset';
import spritePath from 'gridicons/svg-sprite/gridicons.svg';

function needsOffset( name, icons ) {
	return icons.indexOf( name ) >= 0;
}

const Gridicon = React.forwardRef( ( props, ref ) => {
	const { size = 24, icon, onClick, className, ...otherProps } = props;
	const isModulo18 = size % 18 === 0;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `gridicons-${ icon }`;
	const offsetClasses = isModulo18
		? [
				needsOffset( iconName, iconsThatNeedOffset ) ? 'needs-offset' : false,
				needsOffset( iconName, iconsThatNeedOffsetX ) ? 'needs-offset-x' : false,
				needsOffset( iconName, iconsThatNeedOffsetY ) ? 'needs-offset-y' : false,
		  ]
		: [];
	const iconClass = classnames( 'gridicon', iconName, className, ...offsetClasses );
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={ iconClass }
			height={ size }
			width={ size }
			onClick={ onClick }
			ref={ ref }
			{ ...otherProps }
		>
			<use xlinkHref={ `${ spritePath }#${ iconName }` } />
		</svg>
	);
} );

Gridicon.propTypes = {
	icon: PropTypes.string.isRequired,
	size: PropTypes.number,
	onClick: PropTypes.func,
	className: PropTypes.string,
};

export default React.memo( Gridicon );
