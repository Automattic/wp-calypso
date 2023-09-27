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

const Header = ( { domainName } ) => (
	<div className="plans__header">
		<FormattedHeader
			brandFont
			headerText={ translate( 'Choose the perfect plan' ) }
			align="center"
		/>
		{ domainName ? (
			<>
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
			</>
		) : (
			<p>{ translate( 'See and compare the features available on each WordPress.com plan.' ) }</p>
		) }
	</div>
);

const Plans = ( { domainName, onUpgradeClick, handleRedirect } ) => (
	<PlansFeaturesMain
		paidDomainName={ domainName }
		intent="plans-jetpack-app-site-creation"
		isInSignup={ true }
		intervalType="yearly"
		onUpgradeClick={ onUpgradeClick }
		plansWithScroll={ false }
		flowName="onboarding"
		removePaidDomain={ handleRedirect }
		hidePlanTypeSelector={ true }
	/>
);

const Loading = () => (
	<div className="plans__loading">
		<LoadingEllipsis active />
	</div>
);

const JetpackAppPlans = ( { domainName, redirectTo } ) => {
	const planSlug = useSelector( ( state ) =>
		getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 )
	);
	const plansLoaded = Boolean( planSlug );

	const handleRedirect = ( data ) => {
		if ( redirectTo ) {
			const cartItemParam = data
				? `?cart_item=${ encodeURIComponent( JSON.stringify( data ) ) }`
				: '';
			window.location.href = `${ redirectTo }${ cartItemParam }`;
		}
	};

	const onUpgradeClick = ( cartItems ) => {
		if ( ! cartItems ) {
			return handleRedirect();
		}

		const { product_slug: planProductSlug } = getPlanCartItem( cartItems );
		const plan = getPlan( planProductSlug );
		const cartItem = {
			product_id: plan.getProductId(),
			product_slug: plan.getStoreSlug(),
		};

		handleRedirect( cartItem );
	};

	return (
		<Main className="jetpack-app-plans">
			<QueryPlans />
			{ plansLoaded ? (
				<>
					<Header domainName={ domainName } />
					<Plans
						domainName={ domainName }
						onUpgradeClick={ onUpgradeClick }
						handleRedirect={ handleRedirect }
					/>
				</>
			) : (
				<Loading />
			) }
		</Main>
	);
};

export default JetpackAppPlans;
