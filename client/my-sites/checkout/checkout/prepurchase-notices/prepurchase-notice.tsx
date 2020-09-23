/**
 * External dependencies
 */
import React from 'react';

/**
 * Type dependencies
 */
import { TranslateResult } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	message: TranslateResult;
	linkUrl?: string;
	linkText?: TranslateResult;
};

const PrePurchaseNotice = ( { message, linkUrl, linkText }: Props ) => (
	<div className="prepurchase-notice">
		<p className="prepurchase-notice__message">{ message }</p>
		{ linkUrl && linkText && (
			<a className="prepurchase-notice__link" href={ linkUrl }>
				{ linkText }
			</a>
		) }
	</div>
);

export default PrePurchaseNotice;
