/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import { useTranslate } from 'i18n-calypso';

export default function WaitForKey() {
	const translate = useTranslate();

	return (
		<div className="security-2fa-key__add-wait-for-key">
			<Spinner />
			<p className="security-2fa-key__add-wait-for-key-heading">
				{ translate( 'Waiting for security key' ) }
			</p>
			<p>{ translate( 'Connect and touch your security key to register it.' ) }</p>
		</div>
	);
}
