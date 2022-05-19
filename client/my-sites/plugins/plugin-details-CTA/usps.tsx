import { PLAN_BUSINESS_MONTHLY, PLAN_BUSINESS, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
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
	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite?.ID )
	);

	const planDisplayCost = useSelector( ( state ) => {
		const productSlug = isAnnualPeriod ? PLAN_BUSINESS : PLAN_BUSINESS_MONTHLY;
		return getProductDisplayCost( state, eligibleForProPlan ? PLAN_WPCOM_PRO : productSlug );
	} );

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
						text: eligibleForProPlan
							? translate( 'Included in the Pro plan (%s):', {
									args: [ planDisplayCost ],
							  } )
							: translate( 'Included in the Business plan (%s):', {
									args: [ planDisplayCost ],
							  } ),
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
		...( shouldUpgrade
			? [
					{
						id: 'hosting',
						image: <Gridicon icon="star-outline" size={ 16 } />,
						text: translate( 'Best-in-class hosting' ),
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade || isMarketplaceProduct
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
