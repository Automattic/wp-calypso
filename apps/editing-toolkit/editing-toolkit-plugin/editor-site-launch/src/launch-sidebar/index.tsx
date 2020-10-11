/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import LaunchMenu from '../launch-menu';

import './styles.scss';

const LaunchSidebar = () => (
	<div className="nux-launch-sidebar">
		<h2>{ __( "You're almost there!", 'full-site-editing' ) }</h2>
		<h3>
			{ __(
				'Complete the following steps to launch your site. Your site will remain private until you Launch.',
				'full-site-editing'
			) }
		</h3>
		<LaunchMenu />
	</div>
);

export default LaunchSidebar;
