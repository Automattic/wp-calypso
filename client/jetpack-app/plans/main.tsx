import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import type { Plan } from '@automattic/calypso-products';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { AppState } from 'calypso/types';

import './style.scss';

interface HeaderProps {
	paidDomainName?: string;
}

interface JetpackAppPlansProps {
	paidDomainName?: string;
	redirectTo?: string;
}

const Header: React.FC< HeaderProps > = ( { paidDomainName } ) => {
	const translate = useTranslate();

	return (
		<div className="plans__header">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Choose the perfect plan' ) }
				align="center"
			/>
			{ paidDomainName ? (
				<>
					<p>
						{ translate(
							'With your annual plan, you’ll get %(domainName)s {{strong}}free for the first year{{/strong}}.',
							{
								args: {
									domainName: paidDomainName,
								},
								components: { strong: <strong /> },
							}
						) }
					</p>
					<p>
						{ translate(
							'You’ll also unlock advanced features that make it easy to build and grow your site.'
						) }
					</p>
				</>
			) : (
				<p>{ translate( 'See and compare the features available on each WordPress.com plan.' ) }</p>
			) }
		</div>
	);
};

const JetpackAppPlans: React.FC< JetpackAppPlansProps > = ( { paidDomainName, redirectTo } ) => {
	const planSlug = useSelector( ( state: AppState ) =>
		getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 )
	) as string | null;
	const plansLoaded = Boolean( planSlug );

	const handleRedirect = ( planId?: number ) => {
		if ( redirectTo ) {
			const cartItemParam = planId ? `?plan_id=${ planId }` : '';
			window.location.href = `${ redirectTo }${ cartItemParam }`;
		}
	};

	const onUpgradeClick = ( cartItems?: MinimalRequestCartProduct[] | null | undefined ) => {
		const productSlug = getPlanCartItem( cartItems )?.product_slug;

		if ( ! productSlug ) {
			return handleRedirect();
		}

		const plan = getPlan( productSlug ) as Plan;

		handleRedirect( plan.getProductId() );
	};

	return (
		<Main className="jetpack-app-plans">
			<QueryPlans />
			{ plansLoaded ? (
				<>
					<Header paidDomainName={ paidDomainName } />
					<PlansFeaturesMain
						paidDomainName={ paidDomainName }
						intent="plans-jetpack-app-site-creation"
						isInSignup
						intervalType="yearly"
						onUpgradeClick={ onUpgradeClick }
						plansWithScroll={ false }
						removePaidDomain={ handleRedirect }
						hidePlanTypeSelector
						hidePlansFeatureComparison
					/>
				</>
			) : (
				<div className="plans__loading">
					<LoadingEllipsis />
				</div>
			) }
		</Main>
	);
};

export default JetpackAppPlans;
