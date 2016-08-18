/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanIcon from 'components/plans/plan-icon';
import HappinessSupport from 'components/happiness-support';

export default ( {
	selectedSite,
	title,
	tagLine,
	isPlaceholder = false
} ) => {
	const currentPlan = selectedSite.plan.product_slug;

	return (
		<div className="current-plan__header">
			<div className="current-plan__header-item">
				<div className="current-plan__header-item-content">
					<div className="current-plan__header-icon">
						{
							currentPlan &&
							<PlanIcon plan={ currentPlan } />
						}
					</div>
					<div className="current-plan__header-copy">
						<h1 className={
							classNames( 'current-plan__header-heading', {
								'is-placeholder': isPlaceholder
							} )
						} >
							{ title }
						</h1>

						<h2 className={
							classNames( 'current-plan__header-text', {
								'is-placeholder': isPlaceholder
							} )
						} >
							{ tagLine }
						</h2>
					</div>
				</div>
			</div>

			<div className="current-plan__header-item">
				<div className="current-plan__header-item-content">
					<HappinessSupport
						isJetpack={ !! selectedSite.jetpack }
						isPlaceholder={ isPlaceholder }
					/>
				</div>
			</div>
		</div>
	);
};
