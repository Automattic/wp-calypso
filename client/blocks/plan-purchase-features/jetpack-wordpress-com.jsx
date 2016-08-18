/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="plugins"
				title={ translate( 'Get the most from WordPress.com' ) }
				description={ translate(
					'Enable plugin auto-updates, browse your stats, try the improved WordPress.com editor, ' +
					'{{a}}Download WordPress.com apps{{/a}}.',
					{
						components: {
							a: <a href="https://apps.wordpress.com/" />
						}
					}
				) }
				buttonText={ translate( 'Turn on autoupdates' ) }
				href={ `/plugins/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
