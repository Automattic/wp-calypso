/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { CompactCard } from '@automattic/components';

export default function AccountLevelPurchaseLinks() {
	const translate = useTranslate();
	return (
		<>
			<CompactCard href="/me/purchases">{ translate( 'View all purchases' ) }</CompactCard>
		</>
	);
}
