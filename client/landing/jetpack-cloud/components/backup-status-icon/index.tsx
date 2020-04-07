/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import backupSuccessIcon from './images/backup-success.svg';
import backupErrorIcon from './images/backup-error.svg';

interface Props {
	icon: string;
	className?: string;
}

function BackupStatusIcon( props: Props ) {
	const { icon, className } = props;

	return (
		<img
			src={ 'success' === icon ? backupSuccessIcon : backupErrorIcon }
			className={ classnames( 'backup-status-icon', `backup-status-icon__${ icon }`, className ) }
			role="presentation"
			alt=""
		/>
	);
}

BackupStatusIcon.defaultProps = {
	icon: 'success',
};

export default BackupStatusIcon;
