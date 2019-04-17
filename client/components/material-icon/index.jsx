/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import spritePath from '@automattic/material-design-icons/svg-sprite/material-icons.svg';

function MaterialIcon( props ) {
	const { size = 24, style = 'outline', icon, onClick, className, ...otherProps } = props;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `material-icon-${ icon }`;
	const iconClass = classnames( 'material-icon', iconName, className );

	const svgId = `icon-${ style }-${ icon }-${ size }px`;

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
			<use xlinkHref={ `${ spritePath }#${ svgId }` } />
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
