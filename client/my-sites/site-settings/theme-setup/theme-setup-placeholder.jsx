/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const ThemeSetupPlaceholder = () => {
	return (
		<div className="card settings-action-panel">
			<div className="settings-action-panel__body">
				<h2 className="settings-action-panel__title">
					<span className="is-placeholder">Theme Setup</span>
				</h2>
				<div className="notice is-placeholder">
					<span className="notice__text">Notice</span>
				</div>
				<p className="is-placeholder">Want your site to look like the demo? Use Theme Setup to automatically apply the demo site's settings to your site.</p>
				<p className="is-placeholder">You can apply Theme Setup to your current site and keep all your posts, pages, and widgets, or use it for a fresh start and delete everything currently on your site. In both cases, placeholder text will appear on your site – some themes need certain elements to look like the demo, so Theme Setup adds those for you. Please customize it!</p>
			</div>
			<div className="settings-action-panel__footer">
				<button className="button theme-setup__button is-placeholder">Set Up And Keep Content</button>
				<button className="button theme-setup__button is-placeholder">Set Up And Delete Content</button>
			</div>
		</div>
	);
};

export default ThemeSetupPlaceholder;

