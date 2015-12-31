/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { addCurrentPlanToCartAndRedirect, getCurrentPlan, getDaysSinceTrialStarted } from 'lib/plans';
import i18n from 'lib/mixins/i18n';
import Notice from 'components/notice';

const FreeTrialNotice = ( { cart, selectedSite, sitePlans } ) => {
	const isDataLoading = ! cart.hasLoadedFromServer || ! sitePlans.hasLoadedFromServer,
		currentPlan = getCurrentPlan( sitePlans.data );

	if ( isDataLoading || ! currentPlan.freeTrial ) {
		return <noscript />;
	}

	return (
		<Notice
			status="is-info"
			showDismiss={ false }>
			{
				i18n.translate( 'You are currently on day %(day)d of your %(planName)s trial.', {
					args: {
						day: getDaysSinceTrialStarted( currentPlan ),
						planName: currentPlan.productName
					}
				} )
			}
			{ ' ' }
			{
				i18n.translate( 'Get a free domain when you {{a}}upgrade{{/a}}.', {
					components: {
						a: <a
							href="#"
							onClick={ addCurrentPlanToCartAndRedirect.bind( null, sitePlans, selectedSite ) } />
					}
				} )
			}
		</Notice>
	);
};

export default FreeTrialNotice;
