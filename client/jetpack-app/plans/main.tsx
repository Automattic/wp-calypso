import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Plan } from '@automattic/calypso-products';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

import './style.scss';

interface HeaderProps {
	paidDomainName?: string;
}

interface JetpackAppPlansProps {
	paidDomainName?: string;
	originalUrl: string;
}

const Header: React.FC< HeaderProps > = ( { paidDomainName } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-app__plans-header">
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

const JetpackAppPlans: React.FC< JetpackAppPlansProps > = ( { paidDomainName, originalUrl } ) => {
	const dispatch = useDispatch();
	const freeDomainSuggestionNameRef = useRef< string | undefined >( undefined );

	const onUpgradeClick = ( cartItems?: MinimalRequestCartProduct[] | null | undefined ) => {
		const productSlug = getPlanCartItem( cartItems )?.product_slug;

		type PlansParameters = { plan_id?: number; plan_slug: string; domain_name?: string };
		let args: PlansParameters;

		if ( ! productSlug ) {
			args = { plan_slug: PLAN_FREE, domain_name: freeDomainSuggestionNameRef.current };

			dispatch(
				recordTracksEvent( 'calypso_signup_free_plan_select', { from_section: 'default' } )
			);
		} else {
			const plan = getPlan( productSlug ) as Plan;
			args = { plan_id: plan.getProductId(), plan_slug: productSlug, domain_name: paidDomainName };

			dispatch(
				recordTracksEvent( 'calypso_signup_plan_select', {
					product_slug: productSlug,
					from_section: 'default',
				} )
			);
		}

		window.location.href = addQueryArgs( originalUrl, args );
	};

	const setSiteUrlAsFreeDomainSuggestion = ( freeDomainSuggestion: { domain_name: string } ) => {
		freeDomainSuggestionNameRef.current = freeDomainSuggestion.domain_name;
	};

	return (
		<Main className="jetpack-app__plans">
			<Header paidDomainName={ paidDomainName } />
			<PlansFeaturesMain
				paidDomainName={ paidDomainName }
				intent="plans-jetpack-app-site-creation"
				isInSignup
				intervalType="yearly"
				onUpgradeClick={ onUpgradeClick }
				plansWithScroll={ false }
				hidePlanTypeSelector
				hidePlansFeatureComparison
				setSiteUrlAsFreeDomainSuggestion={ setSiteUrlAsFreeDomainSuggestion }
			/>
		</Main>
	);
};

export default JetpackAppPlans;
