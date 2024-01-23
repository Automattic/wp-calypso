import { useTranslate } from 'i18n-calypso';
import {
	getPlan,
	getPlanClass,
	isP2FreePlan,
	isBusinessPlan,
	isFreePlan,
	planMatches,
	PLAN_P2_FREE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
} from '@automattic/calypso-products';
import { isMobile } from '@automattic/viewport';
import { formatCurrency } from '@automattic/format-currency';
import type {
	PlanAction,
	PlanActionGetter,
	PlanActionOverrides,
	GridPlan,
} from '@automattic/plans-grid-next';

type TranslateFunc = ReturnType< typeof useTranslate >;

function getSignupPlanActions(
	translate: TranslateFunc,
	handleUpgradeButtonClick: ( isFreeTrialPlan?: boolean ) => void,
	isStuck: boolean,
	hasFreeTrialPlan?: boolean,
	isLargeCurrency?: boolean,
	planActionOverrides?: PlanActionOverrides
): PlanActionGetter {
	return ( {
		planSlug,
		pricing: { currencyCode, originalPrice, discountedPrice },
	}: GridPlan ): PlanAction => {
		const planTitle = getPlan( planSlug )?.getTitle() || '';
		const priceString = formatCurrency(
			( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
			currencyCode || 'USD',
			{
				stripZeros: true,
				isSmallestUnit: true,
			}
		);

		const postButtonText = isBusinessPlan( planSlug ); // && planActionOverrides?.trialAlreadyUsed?.postButtonText;

		let btnText = translate( 'Get %(plan)s', {
			args: {
				plan: planTitle,
			},
		} );

		const onClick = () => handleUpgradeButtonClick( hasFreeTrialPlan );

		if ( isFreePlan( planSlug ) ) {
			btnText = translate( 'Start with Free' );
		} else if ( isStuck && ! isLargeCurrency ) {
			btnText = translate( 'Get %(plan)s – %(priceString)s', {
				args: {
					plan: planTitle,
					priceString: priceString ?? '',
				},
				comment:
					'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
			} );
		} else if ( isStuck && isLargeCurrency ) {
			btnText = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
				args: {
					plan: planTitle,
					priceString: priceString ?? '',
				},
				comment:
					'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
				// TODO: update the file into tsx
				// components: {
				// 	span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
				// },
			} );
		}

		if ( hasFreeTrialPlan ) {
			return {
				text: translate( 'Try for free' ),
				onClick,
			};
			/* TODO: needs to handle this special case ...
			return (
				<div className="plan-features-2023-grid__multiple-actions-container">
					<PlanButton planSlug={ planSlug } onClick={ onClick } busy={ busy }>
						{ translate( 'Try for free' ) }
					</PlanButton>
					{ ! isStuck && ( // along side with the free trial CTA, we also provide an option for purchasing the plan directly here
						<PlanButton
							planSlug={ planSlug }
							onClick={ () => handleUpgradeButtonClick( false ) }
							borderless
						>
							{ btnText }
						</PlanButton>
					) }
				</div>
			);
			*/
		}
		return {
			text: btnText,
			onClick,
		};

		/* TODO: need to handle the post button thing
		return (
			<>
				<PlanButton planSlug={ planSlug } onClick={ onClick } busy={ busy }>
					{ btnText }
				</PlanButton>
				{ postButtonText && (
					<span className="plan-features-2023-grid__actions-post-button-text">
						{ postButtonText }
					</span>
				) }
			</>
		);
		*/
	};
}

function getLaunchPagePlanActions(
	translate: TranslateFunc,
	handleUpgradeButtonClick: ( isFreeTrialPlan?: boolean ) => void,
	isStuck: boolean,
	isLargeCurrency?: boolean
): PlanActionGetter {
	return ( {
		planSlug,
		pricing: { currencyCode, originalPrice, discountedPrice },
	}: GridPlan ): PlanAction => {
		const planTitle = getPlan( planSlug )?.getTitle() || '';
		const priceString = formatCurrency(
			( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
			currencyCode || 'USD',
			{
				stripZeros: true,
				isSmallestUnit: true,
			}
		);

		let buttonText = translate( 'Select %(plan)s', {
			args: {
				plan: planTitle,
			},
			context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
			comment:
				'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
		} );

		if ( isFreePlan( planSlug ) ) {
			buttonText = translate( 'Keep this plan', {
				comment:
					'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
			} );
		} else if ( isStuck && ! isLargeCurrency ) {
			buttonText = translate( 'Select %(plan)s – %(priceString)s', {
				args: {
					plan: planTitle,
					priceString: priceString ?? '',
				},
				comment:
					'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Select Premium - $10',
			} );
		}

		return {
			text: buttonText,
			onClick: handleUpgradeButtonClick,
		};
	};
}

function getLoggedInPlanActions(
	translate: TranslateFunc,
	handleUpgradeButtonClick: ( isFreeTrialPlan?: boolean ) => void,
	isStuck: boolean,
	currentSiteGridPlan?: GridPlan,
	defaultStorageOption?: any,
	isLargeCurrency?: boolean,
	selectedStorageOptionForPlan?: string,
	buttonText?: string,
	planActionOverrides?: PlanActionOverrides
): PlanActionGetter {
	return ( {
		planSlug,
		current,
		storageAddOnsForPlan,
		isMonthlyPlan,
		availableForPurchase,
		pricing: { billingPeriod, currencyCode, originalPrice, discountedPrice },
	}: GridPlan ): PlanAction | null => {
		const planTitle = getPlan( planSlug )?.getTitle() || '';
		const priceString = formatCurrency(
			( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
			currencyCode || 'USD',
			{
				stripZeros: true,
				isSmallestUnit: true,
			}
		);
		// const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
		const currentSitePlanSlug = currentSiteGridPlan?.planSlug || null;
		const currentPlanBillingPeriod = currentSiteGridPlan?.pricing.billingPeriod || null;
		const canPurchaseStorageAddOns = storageAddOnsForPlan?.some(
			( storageAddOn ) => ! storageAddOn?.purchased && ! storageAddOn?.exceedsSiteStorageLimits
		);
		const storageAddOnCheckoutHref = storageAddOnsForPlan?.find(
			( addOn ) =>
				selectedStorageOptionForPlan &&
				addOn?.featureSlugs?.includes( selectedStorageOptionForPlan )
		)?.checkoutLink;
		const nonDefaultStorageOptionSelected = defaultStorageOption !== selectedStorageOptionForPlan;

		if (
			isFreePlan( planSlug ) ||
			( storageAddOnsForPlan && ! canPurchaseStorageAddOns && nonDefaultStorageOptionSelected )
		) {
			// TODO: it should doable to deprecatee planActionOverrides completely
			if ( planActionOverrides?.loggedInFreePlan ) {
				return {
					onClick: planActionOverrides.loggedInFreePlan.callback,
					current,
					text: planActionOverrides.loggedInFreePlan.text || '',
				};
			}

			if ( isP2FreePlan( planSlug ) && current ) {
				return null;
			}

			return {
				text: translate( 'Contact support', { context: 'verb' } ),
				current,
				disabled: true,
			};
		}

		if ( current && planSlug !== PLAN_P2_FREE ) {
			if ( canPurchaseStorageAddOns && nonDefaultStorageOptionSelected && ! isMonthlyPlan ) {
				return {
					href: storageAddOnCheckoutHref,
					classes: 'is-storage-upgradeable',
					text: translate( 'Upgrade' ),
				};
			} else if ( planActionOverrides?.currentPlan ) {
				const { callback, text } = planActionOverrides.currentPlan;
				return {
					disabled: ! callback,
					onClick: callback,
					current,
					text: text || '',
				};
			}
			return {
				current,
				disabled: true,
				text: translate( 'Active Plan' ),
			};
		}

		const isTrialPlan =
			currentSitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ||
			currentSitePlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
			currentSitePlanSlug === PLAN_HOSTING_TRIAL_MONTHLY;

		// If the current plan is on a higher-term but lower-tier, then show a "Contact support" button.
		if (
			availableForPurchase &&
			currentSitePlanSlug &&
			! current &&
			! isTrialPlan &&
			currentPlanBillingPeriod &&
			billingPeriod &&
			currentPlanBillingPeriod > billingPeriod
		) {
			return {
				disabled: true,
				current,
				text: translate( 'Contact support', { context: 'verb' } ),
			};
		}

		// If the current plan matches on a lower-term, then show an "Upgrade to..." button.
		if (
			availableForPurchase &&
			currentSitePlanSlug &&
			! current &&
			getPlanClass( planSlug ) === getPlanClass( currentSitePlanSlug ) &&
			! isTrialPlan
		) {
			if ( planMatches( planSlug, { term: TERM_TRIENNIALLY } ) ) {
				return {
					onClick: handleUpgradeButtonClick,
					current,
					text: buttonText || translate( 'Upgrade to Triennial' ),
				};
			}

			if ( planMatches( planSlug, { term: TERM_BIENNIALLY } ) ) {
				return {
					onClick: handleUpgradeButtonClick,
					current,
					text: buttonText || translate( 'Upgrade to Biennial' ),
				};
			}

			if ( planMatches( planSlug, { term: TERM_ANNUALLY } ) ) {
				return {
					onClick: handleUpgradeButtonClick,
					current,
					text: buttonText || translate( 'Upgrade to Yearly' ),
				};
			}
		}

		let buttonTextFallback;

		if ( buttonText ) {
			buttonTextFallback = buttonText;
		} else if ( isStuck && ! isLargeCurrency ) {
			buttonTextFallback = translate( 'Upgrade – %(priceString)s', {
				context: 'verb',
				args: { priceString: priceString ?? '' },
				comment: '%(priceString)s is the full price including the currency. Eg: Get Upgrade - $10',
			} );
		} else if ( isStuck && isLargeCurrency ) {
			buttonTextFallback = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
				args: {
					plan: planTitle,
					priceString: priceString ?? '',
				},
				comment:
					'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
				// TODO:
				// components: {
				// 	span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
				// },
			} );
		} else {
			buttonTextFallback = translate( 'Upgrade', { context: 'verb' } );
		}

		if ( availableForPurchase ) {
			return {
				onClick: handleUpgradeButtonClick,
				current,
				text: buttonTextFallback,
			};
		}

		if ( ! availableForPurchase ) {
			return {
				text: isMobile()
					? translate( 'Please contact support to downgrade your plan.' )
					: translate( 'Downgrade', { context: 'verb' } ),
				tooltip: translate( 'Please contact support to downgrade your plan.' ),
				disabled: true, // TODO: implement the downgrading behavior
			};
		}

		return null;
	};
}

function usePlanActions( isLaunchPage: boolean, isInSignup: boolean ): PlanActionGetter {
	const translate = useTranslate();

	if ( isLaunchPage ) {
		return getLaunchPagePlanActions( translate );
	}

	if ( isInSignup ) {
		return getSignupPlanActions( translate );
	}

	return getLoggedInPlanActions( translate );
}

export default usePlanActions;
