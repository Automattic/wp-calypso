import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

export default function AccountLevelPurchaseLinks() {
	const translate = useTranslate();
	return (
		<>
			<CompactCard href="/me/purchases">{ translate( 'View all purchases' ) }</CompactCard>
		</>
	);
}
