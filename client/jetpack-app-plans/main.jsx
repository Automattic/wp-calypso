import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { getPlanSlug } from 'calypso/state/plans/selectors';

import './style.scss';

const JetpackAppPlans = ( { domainName, redirectTo } ) => {
	const planSlug = useSelector( ( state ) =>
		getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 )
	);
	const plansLoaded = Boolean( planSlug );

	// Helper function to handle redirection
	const handleRedirect = ( data ) => {
		if ( redirectTo ) {
			window.location.href = `${ redirectTo }${
				data ? `?cart_item=${ encodeURIComponent( JSON.stringify( data ) ) }` : ''
			}`;
		}
	};

	const onUpgradeClick = ( cartItems ) => {
		// There're no cartItems object if the free plan is selected
		if ( cartItems ) {
			const planCartItem = getPlanCartItem( cartItems );
			const planProductSlug = planCartItem.product_slug;
			const plan = getPlan( planProductSlug );
			const cartItem = {
				product_id: plan.getProductId(),
				product_slug: plan.getStoreSlug(),
			};
			handleRedirect( cartItem );
		} else {
			handleRedirect();
		}
	};

	const headline = translate( 'Choose the perfect plan' );

	return (
		<Main className="jetpack-app-plans">
			<QueryPlans />
			{ plansLoaded ? (
				<div className="plans__header">
					<FormattedHeader brandFont headerText={ headline } align="center" />
					<p>
						{ translate(
							'With your annual plan, you’ll get %(domainName)s {{strong}}free for the first year{{/strong}}.',
							{
								args: { domainName },
								components: { strong: <strong /> },
							}
						) }
					</p>
					<p>
						{ translate(
							'You’ll also unlock advanced features that make it easy to build and grow your site.'
						) }
					</p>
					<PlansFeaturesMain
						paidDomainName={ domainName }
						intent="plans-jetpack-app-site-creation"
						isInSignup
						intervalType="yearly"
						onUpgradeClick={ onUpgradeClick }
						plansWithScroll={ false }
						flowName="onboarding"
						removePaidDomain={ handleRedirect }
						hidePlanTypeSelector
					/>
				</div>
			) : (
				<div className="plans__loading">
					<LoadingEllipsis active />
				</div>
			) }
		</Main>
	);
};

export default JetpackAppPlans;
