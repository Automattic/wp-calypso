import { TYPE_BLOGGER, planMatches, isFreePlan, getPlanClass } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import PlanFeaturesActions from './actions';

export default function PlanFeaturesActionsWrapper( {
	canPurchase,
	className,
	disableBloggerPlanWithNonBlogDomain,
	handleUpgradeClick,
	isInSignup,
	isLandingPage,
	isLaunchPage,
	nonDotBlogDomains,
	planPropertiesPlan,
	redirectToAddDomainFlow,
	selectedPlan,
	selectedSiteSlug,
	purchaseId,
} ) {
	const translate = useTranslate();
	let { availableForPurchase } = planPropertiesPlan;
	const {
		current,
		planName,
		primaryUpgrade,
		isPlaceholder,
		planConstantObj,
		popular,
	} = planPropertiesPlan;

	const classes = classNames( 'plan-features__table-item', 'has-border-bottom', className );
	let buttonText;
	let forceDisplayButton = false;

	if ( disableBloggerPlanWithNonBlogDomain || nonDotBlogDomains.length > 0 ) {
		if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
			availableForPurchase = false;
			forceDisplayButton = true;
			buttonText = translate( 'Only with .blog domains' );
		}
	}

	if ( redirectToAddDomainFlow ) {
		buttonText = translate( 'Add to Cart' );
		forceDisplayButton = true;
	}

	return (
		<td key={ planName } className={ classes }>
			<PlanFeaturesActions
				availableForPurchase={ availableForPurchase }
				forceDisplayButton={ forceDisplayButton }
				buttonText={ buttonText }
				canPurchase={ canPurchase }
				className={ getPlanClass( planName ) }
				current={ current }
				freePlan={ isFreePlan( planName ) }
				isInSignup={ isInSignup }
				isLandingPage={ isLandingPage }
				isLaunchPage={ isLaunchPage }
				isPlaceholder={ isPlaceholder }
				isPopular={ popular }
				manageHref={
					purchaseId
						? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
						: `/plans/my-plan/${ selectedSiteSlug }`
				}
				planName={ planConstantObj.getTitle() }
				planType={ planName }
				primaryUpgrade={ primaryUpgrade }
				onUpgradeClick={ () => handleUpgradeClick( planPropertiesPlan ) }
				selectedPlan={ selectedPlan }
			/>
		</td>
	);
}
