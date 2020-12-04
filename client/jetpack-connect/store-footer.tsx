/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getFaqComponent } from 'calypso/my-sites/plans/jetpack-plans/iterations';

const StoreFooter: React.FC = () => {
	const JetpackFAQComponent = getFaqComponent();

	if ( JetpackFAQComponent ) {
		return <JetpackFAQComponent />;
	}

	return null;
};

export default StoreFooter;
