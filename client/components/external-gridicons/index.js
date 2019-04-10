/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import svg4everybody from 'svg4everybody';

/**
 * Internal dependencies
 */
import { iconsThatNeedOffset, iconsThatNeedOffsetX, iconsThatNeedOffsetY } from './icons-offset';

function needsOffset( name, icons ) {
	return icons.indexOf( name ) >= 0;
}

const isBrowser = typeof window !== 'undefined';
if ( isBrowser ) {
	// Polyfill SVG external content support. Noop in the evergreen build.
	svg4everybody();
}

function ExternalGridicons( props ) {
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
	const iconClass = [ 'gridicon', iconName, className, ...offsetClasses ]
		.filter( Boolean ) // Remove all falsy values.
		.join( ' ' );

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={ iconClass }
			height={ size }
			width={ size }
			onClick={ onClick }
			{ ...otherProps }
		>
			<use xlinkHref={ `/calypso/images/gridicons/sprite.svg#${ iconName }` } />
		</svg>
	);
}

ExternalGridicons.propTypes = {
	icon: PropTypes.string.isRequired,
	size: PropTypes.number,
	onClick: PropTypes.func,
	className: PropTypes.string,
};

export default React.memo( ExternalGridicons );
