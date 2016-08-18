/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HappinessSupport from 'components/happiness-support';

export default ( { selectedSite } ) => {
	return (
		<div className="plan-purchase-features__item">
			<div className="plan-purchase-features__item-content">
				<HappinessSupport
					isJetpack={ !! selectedSite.jetpack }
					isPlaceholder={ false }
				/>
			</div>
		</div>
	);
};
