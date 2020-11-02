/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

function ListDelete() {
	const translate = useTranslate();
	return (
		<Card>
			<p>{ translate( 'Delete the list forever. Be careful - this is not reversible.' ) }</p>
		</Card>
	);
}

export default ListDelete;
