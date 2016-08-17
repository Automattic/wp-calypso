/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanIcon from 'components/plans/plan-icon';

export default ( {
	selectedSite,
	hasLoadedFromServer,
	title,
	tagLine
} ) => {
	const currentPlan = selectedSite.plan.product_slug;

	return (
		<div className="plan-purchase-features__item">
			<div className="plan-purchase-features__item-content">
				<div className="plan-purchase-features__header-icon">
					{
						currentPlan &&
							<PlanIcon plan={ currentPlan } />
					}
				</div>
				<div className="plan-purchase-features__header-copy">
					<h1 className={
						classNames( {
							'plan-purchase-features__header-heading': true,
							'is-placeholder': ! hasLoadedFromServer
						} )
					} >
						{ title }
					</h1>

					<h2 className={
						classNames( {
							'plan-purchase-features__header-text': true,
							'is-placeholder': ! hasLoadedFromServer
						} )
					} >
						{ tagLine }
					</h2>
				</div>
			</div>
		</div>
	);
};
