import { TranslateResult, useTranslate } from 'i18n-calypso';
import {
	getPlan,
	isBusinessPlan,
	isFreePlan,
	type PlanSlug,
	type StorageOption,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import type { PlanAction, PlanActionGetter, GridPlan } from '@automattic/plans-grid-next';

type TranslateFunc = ReturnType< typeof useTranslate >;

function getSignupPlanActions(
	translate: TranslateFunc,
	handleUpgradeButtonClick: ( isFreeTrialPlan?: boolean ) => void,
	isStuck: boolean,
	hasFreeTrialPlan?: boolean,
	isLargeCurrency?: boolean
): PlanActionGetter {
	return ( {
		planSlug,
		pricing: { currencyCode, originalPrice, discountedPrice },
	}: GridPlan ): PlanAction => {
		const planTitle = getPlan( planSlug )?.getTitle() || '';

		// const postButtonText = isBusinessPlan( planSlug ); // && planActionOverrides?.trialAlreadyUsed?.postButtonText;

		let btnText = translate( 'Get %(plan)s', {
			args: {
				plan: planTitle,
			},
		} );

		const onClick = () => handleUpgradeButtonClick( hasFreeTrialPlan );
		const priceString = formatCurrency(
			( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
			currencyCode || 'USD',
			{
				stripZeros: true,
				isSmallestUnit: true,
			}
		);

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

function getLaunchPagePlanActions( translate: TranslateFunc ): PlanActionGetter {}

function getLoggedInPlanActions( translate: TranslateFunc ): PlanActionGetter {}

function usePlanActions( isLaunchPage: boolean, isInSignup: boolean ): GetPlanActionFunc {
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
