import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_STARTER,
	isBlogger,
	isPersonal,
	isPremium,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import usePluginsSupportText from 'calypso/my-sites/plugins/use-plugins-support-text/';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const StyledUl = styled.ul`
	margin-top: 20px;
	margin-left: 0;
	list-style-type: none;
`;

const StyledLi = styled.li`
	color: var( --studio-gray-50 );
	font-size: 12px;
	display: flex;
	align-items: center;
	margin: 5px 0;

	.title {
		color: var( --studio-gray-50 );
		font-size: 14px;
		font-weight: 500;
		margin-top: 10px;
	}

	svg {
		margin-right: 8px;
	}
`;

interface Props {
	shouldUpgrade: boolean;
	isFreePlan: boolean;
	isMarketplaceProduct: boolean;
	billingPeriod: IntervalLength;
}

const USPS: React.FC< Props > = ( {
	shouldUpgrade,
	isFreePlan,
	isMarketplaceProduct,
	billingPeriod,
} ) => {
	const translate = useTranslate();

	const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;

	const selectedSite = useSelector( getSelectedSite );
	const requiredPlan = useSelector( ( state ) => {
		if ( ! shouldUpgrade ) {
			return '';
		}

		const plan = selectedSite?.plan;
		let isLegacyPlan = false;
		if ( typeof plan !== 'undefined' ) {
			isLegacyPlan = isBlogger( plan ) || isPersonal( plan ) || isPremium( plan );
		}

		if ( ! isLegacyPlan && isMarketplaceProduct ) {
			return PLAN_WPCOM_STARTER;
		}

		if ( ! isLegacyPlan && isEligibleForProPlan( state, selectedSite?.ID ) ) {
			return PLAN_WPCOM_PRO;
		}

		return isAnnualPeriod ? PLAN_BUSINESS : PLAN_BUSINESS_MONTHLY;
	} );

	const planDisplayCost = useSelector( ( state ) => {
		return getProductDisplayCost( state, requiredPlan );
	} );
	let planText;
	switch ( requiredPlan ) {
		case PLAN_WPCOM_STARTER:
			planText = translate( 'Included in the Starter plan (%s):', {
				args: [ planDisplayCost ],
			} );
			break;
		case PLAN_WPCOM_PRO:
			planText = translate( 'Included in the Pro plan (%s):', {
				args: [ planDisplayCost ],
			} );
			break;
		case PLAN_BUSINESS:
		case PLAN_BUSINESS_MONTHLY:
			planText = translate( 'Included in the Business plan (%s):', {
				args: [ planDisplayCost ],
			} );
			break;
	}

	const supportText = usePluginsSupportText();

	const filteredUSPS = [
		...( isMarketplaceProduct
			? [
					{
						id: 'updates',
						image: <Gridicon icon="gift" size={ 16 } />,
						text: translate( 'Plugin updates' ),
						eligibilities: [ 'marketplace' ],
					},
			  ]
			: [] ),
		...( isMarketplaceProduct
			? [
					{
						id: 'refund',
						image: <Gridicon icon="refund" size={ 16 } />,
						text: translate( '%(days)d-day money-back guarantee', {
							args: { days: billingPeriod === IntervalLength.ANNUALLY ? 14 : 7 },
						} ),
						eligibilities: [ 'marketplace' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade
			? [
					{
						id: 'plan',
						className: 'title',
						text: planText,
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( isFreePlan
			? [
					{
						id: 'domain',
						image: <Gridicon icon="domains" size={ 16 } />,
						text: translate( 'Free domain for one year' ),
						eligibilities: [ 'free-plan' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade && requiredPlan === PLAN_WPCOM_STARTER
			? [
					{
						id: 'collect-payments',
						image: <Gridicon icon="money" size={ 16 } />,
						text: translate( 'Payments collection' ),
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade && requiredPlan === PLAN_WPCOM_STARTER
			? [
					{
						id: 'storage',
						image: <Gridicon icon="product" size={ 16 } />,
						text: translate( '6GB of storage' ),
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade && requiredPlan !== PLAN_WPCOM_STARTER
			? [
					{
						id: 'hosting',
						image: <Gridicon icon="star-outline" size={ 16 } />,
						text: translate( 'Best-in-class hosting' ),
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade && requiredPlan !== PLAN_WPCOM_STARTER
			? [
					{
						id: 'support',
						image: <Gridicon icon="chat" size={ 16 } />,
						text: supportText,
						eligibilities: [ 'needs-upgrade', 'marketplace' ],
					},
			  ]
			: [] ),
	];

	return (
		<StyledUl>
			{ filteredUSPS.map( ( usp ) => (
				<StyledLi key={ usp.id }>
					{ usp?.image }
					<span className={ usp.className }>{ usp.text }</span>
				</StyledLi>
			) ) }
		</StyledUl>
	);
};

export default USPS;
