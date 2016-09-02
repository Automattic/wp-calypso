/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import PurchaseDetail from 'components/purchase-detail';
import support from 'lib/url/support';

function trackCoursesButtonClick() {
	analytics.tracks.recordEvent( 'calypso_plan_features_courses_click' );
}

export default localize( ( { translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon="help"
				title={ translate( 'Attend live courses' ) }
				description={
					translate(
						'Register for one of our live courses led by Happiness Engineers to get the most out of your site.'
					)
				}
				buttonText={ translate( 'Register for a course' ) }
				href={ support.CALYPSO_COURSES }
				onClick={ trackCoursesButtonClick }
			/>
		</div>
	);
} );
