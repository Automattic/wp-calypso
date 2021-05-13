/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */

const ThemeSetupPlaceholder = () => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="card action-panel">
			<div className="action-panel__body">
				<h2 className="action-panel__title">
					<span className="is-placeholder">Theme Setup</span>
				</h2>
				<div className="notice is-placeholder">
					<span className="notice__text">Notice</span>
				</div>
				<p className="is-placeholder">
					Want your site to look like the demo? Use Theme Setup to automatically apply the demo
					site's settings to your site.
				</p>
				<p className="is-placeholder">
					You can apply Theme Setup to your current site while keeping all your posts, pages, and
					widgets. Some placeholder text may appear on your site – some themes need certain elements
					to look like the demo, so Theme Setup adds those for you. Please customize it!
				</p>
			</div>
			<div className="action-panel__footer">
				<button className="button theme-setup__button is-placeholder">
					Set Up And Keep Content
				</button>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default ThemeSetupPlaceholder;
