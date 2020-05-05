/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './privacy-policy-dialog.scss';

export default function PrivacyPolicyDialog( { title, content, onClose } ) {
	const translate = useTranslate();

	const buttons = [
		<Button primary onClick={ onClose }>
			{ translate( 'Close' ) }
		</Button>,
	];

	// let's enable `dangerouslySetInnerHTML` since we trust in the content.
	// It's gotten from the privacy-policy WP REST API.
	/* eslint-disable react/no-danger */
	return (
		<Dialog isVisible buttons={ buttons } additionalClassNames="privacy-policy-banner__dialog">
			<div className="privacy-policy-banner__dialog-header">
				<div className="privacy-policy-banner__dialog-header-text">
					<h1>{ title }</h1>
				</div>
			</div>

			<div
				className="privacy-policy-banner__dialog-body"
				dangerouslySetInnerHTML={ { __html: content } }
			/>
		</Dialog>
	);
}
