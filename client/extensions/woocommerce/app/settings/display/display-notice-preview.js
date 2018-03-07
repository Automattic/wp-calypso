/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import BrowserFrame from 'woocommerce/components/browser-frame';
import { decodeEntities } from 'lib/formatting';
import striptags from 'striptags';

const SettingsDisplayNoticePreview = ( { translate, value } ) => {
	const notice = striptags( decodeEntities( value ) );

	return (
		<div className="display__notice-preview">
			<h4>{ translate( 'Preview' ) }</h4>
			<BrowserFrame>
				<div className="display__notice-preview-notice">{ notice }</div>
				<div className="display__notice-preview-content">
					<div className="display__notice-preview-content-primary">
						<div />
					</div>
					<div className="display__notice-preview-content-secondary">
						<div />
					</div>
				</div>
			</BrowserFrame>
			<p className="display__notice-preview-caveat">
				{ translate( 'Note: Overall look may vary based on theme.' ) }
			</p>
		</div>
	);
};

SettingsDisplayNoticePreview.propTypes = {
	value: PropTypes.string,
};

export default localize( SettingsDisplayNoticePreview );
