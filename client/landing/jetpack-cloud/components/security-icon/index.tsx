/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import okayIcon from './images/security-okay.svg';
import errorIcon from './images/security-error.svg';

interface Props {
	icon: string;
	className?: string;
}

function SecurityIcon( props: Props ) {
	const { icon, className } = props;

	let iconPath = okayIcon;
	if ( 'error' === icon ) {
		iconPath = errorIcon;
	}

	return (
		<img
			src={ iconPath }
			className={ classnames( 'security-icon', `security-icon-${ icon }`, className ) }
			role="presentation"
			alt=""
		/>
	);
}

SecurityIcon.defaultProps = {
	icon: 'success',
};

export default SecurityIcon;
