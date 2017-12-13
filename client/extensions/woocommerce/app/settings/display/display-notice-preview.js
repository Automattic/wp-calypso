/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import BrowserFrame from 'woocommerce/components/browser-frame';

const SettingsDisplayNoticePreview = ( { value } ) => {
	return (
		<div className="display__notice-preview">
			<BrowserFrame>
				<div className="display__notice-preview-notice">{ value }</div>
				<div className="display__notice-preview-content">
					<div className="display__notice-preview-content-primary" />
					<div className="display__notice-preview-content-secondary" />
				</div>
			</BrowserFrame>
		</div>
	);
};

SettingsDisplayNoticePreview.propTypes = {
	value: PropTypes.string,
};

export default SettingsDisplayNoticePreview;
