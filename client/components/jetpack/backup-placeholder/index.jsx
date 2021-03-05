/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export default function BackupPlaceholder( { showDatePicker = true } ) {
	return (
		<div className="backup-placeholder">
			{ showDatePicker && <div className="backup-placeholder__backup-date-picker" /> }
			<div className="backup-placeholder__daily-backup-status" />
		</div>
	);
}
