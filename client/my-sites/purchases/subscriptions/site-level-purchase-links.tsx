/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { CompactCard } from '@automattic/components';

export default function SiteLevelPurchaseLinks() {
	const translate = useTranslate();
	// TODO: Fix these links
	return (
		<>
			<CompactCard href="/me/purchases">{ translate( 'View all subscriptions for' ) }</CompactCard>
			<CompactCard href="/me/purchases/billing">
				{ translate( 'View billing history and receipts' ) }
			</CompactCard>
			<CompactCard href="/me/purchases/billing">
				{ translate( 'Manage payment methods' ) }
			</CompactCard>
		</>
	);
}
