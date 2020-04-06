/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PublicizeOptions from './publicize-options';
import SharingLikeOptions from './sharing-like-options';

/**
 * Style dependencies
 */
import './style.scss';

export default function EditorSharing() {
	return (
		<div className="editor-sharing">
			<PublicizeOptions />
			<SharingLikeOptions />
		</div>
	);
}
