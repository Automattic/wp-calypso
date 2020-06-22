/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

export default function BackupPlaceholder() {
	return (
		<>
			<SidebarNavigation />
			{ ! isJetpackCloud() && (
				<FormattedHeader brandFont headerText="Jetpack Backup" align="left" />
			) }
			<div className="backup-placeholder">
				<div className="backup-placeholder__backup-date-picker" />
				<div className="backup-placeholder__daily-backup-status" />
			</div>
		</>
	);
}
