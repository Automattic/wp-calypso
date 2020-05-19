/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';

/**
 * Style dependencies
 */
import './style.scss';

const ScanPlaceholder: FunctionComponent = () => {
	return (
		<div className="scan-placeholder scan__content">
			<SecurityIcon icon="placeholder" />
			<h1 className="scan-placeholder__header scan__header is-placeholder">Scan Result heading</h1>
			<p className="scan-placeholder__content is-placeholder">
				This is some placeholder text there.
			</p>
			<p className="scan-placeholder__content is-placeholder">
				This is some placeholder text there.
			</p>
		</div>
	);
};

export default ScanPlaceholder;
