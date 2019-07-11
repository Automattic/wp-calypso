/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PromoCard from 'components/promo-section/promo-card';
import PromoCardCta from 'components/promo-section/promo-card/cta';

const PromoCardExample = () => {
	const img = {
		path: '/calypso/images/earn/referral.svg',
		alt: 'Using Props',
	};
	return (
		<div className="design-assets__group">
			<div>
				<PromoCard title="Under-used Feature" image={ img }>
					<p>
						This is a description of the action. It gives a bit more detail and explains what we are
						inviting the user to do.
					</p>
					<PromoCardCta
						button={ { isPrimary: false, text: 'Call To Action!', url: '/my-sites' } }
						learnMoreLink="/learn-more"
					/>
				</PromoCard>
			</div>
		</div>
	);
};

PromoCardExample.displayName = 'PromoCard';

export default PromoCardExample;
