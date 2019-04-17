/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import svg4everybody from 'svg4everybody';

const isBrowser = typeof window !== 'undefined';
if ( isBrowser ) {
	// Polyfill SVG external content support. Noop in the evergreen build.
	svg4everybody();
}

function MaterialIcon( props ) {
	const { size = 24, style = 'outline', icon, onClick, className, ...otherProps } = props;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `material-icon-${ icon }`;
	const iconClass = classnames( 'material-icon', iconName, className );

	const svgPath = `icon-${ style }-${ icon }-${ size }px`;

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
			<use xlinkHref={ `/calypso/images/material-design-icons/material-icons.svg#${ svgPath }` } />
		</svg>
	);
}

MaterialIcon.propTypes = {
	icon: PropTypes.string.isRequired,
	style: PropTypes.string,
	size: PropTypes.number,
	onClick: PropTypes.func,
	className: PropTypes.string,
};

export default React.memo( MaterialIcon );
