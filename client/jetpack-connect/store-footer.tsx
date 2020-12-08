/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import JetpackFAQ from 'calypso/my-sites/plans-features-main/jetpack-faq';
import JetpackFAQi5 from 'calypso/my-sites/plans-features-main/jetpack-faq-i5';

export default function StoreFooter() {
	const JetpackFAQComponent = getJetpackCROActiveVersion() === 'i5' ? JetpackFAQi5 : JetpackFAQ;

	return (
		<>
			<JetpackFAQComponent />
		</>
	);
}
