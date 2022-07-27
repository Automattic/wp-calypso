import config from '@automattic/calypso-config';
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
import PluginDetailsSidebarUSP from 'calypso/my-sites/plugins/plugin-details-sidebar-usp';
import usePluginsSupportText from 'calypso/my-sites/plugins/use-plugins-support-text/';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const StyledUl = styled.ul`
	margin-top: 20px;
	margin-left: 0;
	list-style-type: none;
`;

const StyledLi = styled.li`
	color: var( --studio-gray-80 );
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

	&.legacy {
		color: var( --studio-gray-50 );
	}
`;

const GreenGridicon = styled( Gridicon )`
	color: var( --studio-green-50 );
`;

interface Props {
	shouldUpgrade: boolean;
	isFreePlan: boolean;
	isMarketplaceProduct: boolean;
	billingPeriod: IntervalLength;
}

export const USPS: React.FC< Props > = ( {
	shouldUpgrade,
	isFreePlan,
	isMarketplaceProduct,
	billingPeriod,
} ) => {
	const translate = useTranslate();
	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );

	if ( legacyVersion ) {
		return (
			<LegacyUSPS
				shouldUpgrade={ shouldUpgrade }
				isFreePlan={ isFreePlan }
				isMarketplaceProduct={ isMarketplaceProduct }
				billingPeriod={ billingPeriod }
			/>
		);
	}

	if ( ! isMarketplaceProduct ) {
		return null;
	}

	const filteredUSPS = [
		translate( 'Plugin updates' ),
		translate( '%(days)d-day money-back guarantee', {
			args: { days: billingPeriod === IntervalLength.ANNUALLY ? 14 : 7 },
		} ),
	];

	return (
		<PluginDetailsSidebarUSP
			id="marketplace-product"
			title={ translate( 'Included with your purchase' ) }
			description={
				<StyledUl>
					{ filteredUSPS.map( ( usp, i ) => (
						<StyledLi key={ `usp-${ i }` }>
							<GreenGridicon icon="checkmark" size={ 16 } />
							<span>{ usp }</span>
						</StyledLi>
					) ) }
				</StyledUl>
			}
			first
		/>
	);
};

export const PlanUSPS: React.FC< Props > = ( { shouldUpgrade, isFreePlan, billingPeriod } ) => {
	const translate = useTranslate();

	const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;
	const supportText = usePluginsSupportText();
	const requiredPlan = useRequiredPlan( shouldUpgrade, isAnnualPeriod );
	const planDisplayCost = useSelector( ( state ) => {
		return getProductDisplayCost( state, requiredPlan || '' );
	} );

	if ( ! shouldUpgrade ) {
		return null;
	}

	let planText;
	switch ( requiredPlan ) {
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

	const filteredUSPS = [
		...( isFreePlan ? [ translate( 'Free domain for one year' ) ] : [] ),
		translate( 'Best-in-class hosting' ),
		supportText,
	];

	return (
		<PluginDetailsSidebarUSP
			id="marketplace-plan"
			title={ planText }
			description={
				<StyledUl>
					{ filteredUSPS.map( ( usp, i ) => (
						<StyledLi key={ `usps__-${ i }` }>
							<GreenGridicon icon="checkmark" size={ 16 } />
							<span>{ usp }</span>
						</StyledLi>
					) ) }
				</StyledUl>
			}
			first
		/>
	);
};

function LegacyUSPS( { shouldUpgrade, isFreePlan, isMarketplaceProduct, billingPeriod }: Props ) {
	const translate = useTranslate();

	const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;
	const requiredPlan = useRequiredPlan( shouldUpgrade, isAnnualPeriod );
	const planDisplayCost = useSelector( ( state ) => {
		return getProductDisplayCost( state, requiredPlan || '' );
	} );
	const supportText = usePluginsSupportText();

	let planText;
	switch ( requiredPlan ) {
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
		...( shouldUpgrade
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
				<StyledLi key={ usp.id } className="usps__li legacy">
					{ usp?.image }
					<span className={ usp.className }>{ usp.text }</span>
				</StyledLi>
			) ) }
		</StyledUl>
	);
}

function useRequiredPlan( shouldUpgrade: boolean, isAnnualPeriod: boolean ) {
	const selectedSite = useSelector( getSelectedSite );

	return useSelector( ( state ) => {
		if ( ! shouldUpgrade ) {
			return '';
		}

		if ( isEligibleForProPlan( state, selectedSite?.ID ) ) {
			return PLAN_WPCOM_PRO;
		}

		return isAnnualPeriod ? PLAN_BUSINESS : PLAN_BUSINESS_MONTHLY;
	} );
}

export default USPS;
