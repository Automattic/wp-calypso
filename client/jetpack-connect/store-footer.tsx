/**
 * External dependencies
 */
import React, { useMemo } from 'react';

/**
 * Internal dependencies
 */
import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import JetpackFAQ from 'calypso/my-sites/plans-features-main/jetpack-faq';
import JetpackFAQi5 from 'calypso/my-sites/plans-features-main/jetpack-faq-i5';

const StoreFooter: React.FC = () => {
	const JetpackFAQComponent = useMemo(
		() =>
			getForCurrentCROIteration( {
				[ Iterations.V1 ]: JetpackFAQ as React.FC,
				[ Iterations.V2 ]: JetpackFAQ as React.FC,
				[ Iterations.I5 ]: JetpackFAQi5,
				[ Iterations.SPP ]: JetpackFAQi5,
			} ),
		[]
	);

	if ( JetpackFAQComponent ) {
		return <JetpackFAQComponent />;
	}

	return null;
};

export default StoreFooter;
