/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import errorIcon from './images/error.svg';
import okayIcon from './images/security-okay.svg';
import scanErrorIcon from './images/security-error.svg';
import inProgressIcon from './images/in-progress.svg';
import placeholderIcon from './images/placeholder.svg';
import infoIcon from './images/security-info.svg';

interface Props {
	icon: string;
	className?: string;
}

function SecurityIcon( props: Props ) {
	const { icon, className } = props;

	let iconPath;
	switch ( icon ) {
		case 'placeholder':
			iconPath = placeholderIcon;
			break;
		case 'error':
			iconPath = scanErrorIcon;
			break;
		case 'in-progress':
			iconPath = inProgressIcon;
			break;
		case 'scan-error':
			iconPath = errorIcon;
			break;
		case 'info':
			iconPath = infoIcon;
			break;
		case 'success':
		default:
			iconPath = okayIcon;
			break;
	}

	return (
		<img
			src={ iconPath }
			className={ classnames( 'security-icon', `security-icon__${ icon }`, className ) }
			role="presentation"
			alt=""
		/>
	);
}

SecurityIcon.defaultProps = {
	icon: 'success',
};

export default SecurityIcon;
