/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanIcon from 'components/plans/plan-icon';
import HappinessSupport from 'components/happiness-support';
import Button from 'components/button';
import Card from 'components/card';

export default localize( ( {
	selectedSite,
	title,
	tagLine,
	isPlaceholder = false,
	currentPlanSlug,
	currentPlan,
	isExpiring,
	translate
} ) => {
	function getPurchaseInfo() {
		if ( ! currentPlan ) {
			return null;
		}

		const hasAutoRenew = currentPlan.auto_renew;
		const classes = classNames( 'current-plan__header-purchase-info', {
			'is-expiring': isExpiring
		} );

		return (
			<div className={ classes }>
				<span className="current-plan__header-expires-in">
					{ hasAutoRenew
						? translate( 'Set to Auto Renew on %s.', { args: currentPlan.userFacingExpiryMoment.format( 'LL' ) } )
						: translate( 'Expires on %s.', { args: currentPlan.userFacingExpiryMoment.format( 'LL' ) } )
					}
				</span>
				{ currentPlan.userIsOwner &&
				<Button compact href={ `/purchases/${ selectedSite.slug }/${ currentPlan.id }` }>
					{ hasAutoRenew
						? translate( 'Manage Payment' )
						: translate( 'Renew Now' )
					}
				</Button>
				}
			</div>
		);
	}

	return (
		<div className="current-plan__header">
			<div className="current-plan__header-item">
				<div className="current-plan__header-item-content">
					<div className="current-plan__header-icon">
						{
							currentPlanSlug &&
							<PlanIcon plan={ currentPlanSlug } />
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
					<Card compact>
						{ getPurchaseInfo() }
					</Card>
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
} );
