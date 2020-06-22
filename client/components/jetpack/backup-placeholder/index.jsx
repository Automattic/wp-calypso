/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export default function BackupPlaceholder() {
	return (
		<div className="backup-placeholder">
			<div className="backup-placeholder__backup-date-picker" />
			<div className="backup-placeholder__daily-backup-status" />
		</div>
	);
}
