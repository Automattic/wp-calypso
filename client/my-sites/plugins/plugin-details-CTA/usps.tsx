import config from '@automattic/calypso-config';
import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	getPlan,
} from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import PluginDetailsSidebarUSP from 'calypso/my-sites/plugins/plugin-details-sidebar-usp';
import usePluginsSupportText from 'calypso/my-sites/plugins/use-plugins-support-text';
import { useSelector } from 'calypso/state';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import { isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { PREINSTALLED_PLUGINS } from '../constants';

const StyledUl = styled.ul`
	margin-left: 0;
	margin-bottom: 0;
	list-style-type: none;
`;

const StyledLi = styled.li`
	color: var( --studio-gray-80 );
	font-size: $font-body-small;
	display: flex;
	align-items: flex-start;
	margin: 5px 0;

	.title {
		color: var( --studio-gray-50 );
		font-size: 14px;
		font-weight: 500;
		margin-top: 10px;
	}

	svg {
		min-width: 16px;
		margin-right: 4px;
	}
`;

const GreenIcon = styled( Icon )`
	fill: var( --studio-green-50 );
`;

const useRequiredPlan = ( shouldUpgrade: boolean ) => {
	const siteId = useSelector( getSelectedSite )?.ID;
	const isECommerceTrial = useSelector(
		( state: IAppState ) => siteId && isSiteOnECommerceTrial( state, siteId )
	);
	return useSelector( ( state: IAppState ) => {
		if ( ! shouldUpgrade ) {
			return '';
		}
		const billingPeriod = getBillingInterval( state );
		const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;
		if ( config.isEnabled( 'marketplace-personal-premium' ) ) {
			return isAnnualPeriod ? PLAN_PERSONAL : PLAN_PERSONAL_MONTHLY;
		}

		if ( isECommerceTrial ) {
			return PLAN_ECOMMERCE_TRIAL_MONTHLY;
		}

		return isAnnualPeriod ? PLAN_BUSINESS : PLAN_BUSINESS_MONTHLY;
	} );
};

interface Props {
	pluginSlug: string;
	shouldUpgrade: boolean;
	isFreePlan: boolean;
	isMarketplaceProduct: boolean;
	billingPeriod: IntervalLength;
}

export const USPS: React.FC< Props > = ( { isMarketplaceProduct, billingPeriod } ) => {
	const translate = useTranslate();

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
							<GreenIcon icon={ check } size={ 24 } />
							<span>{ usp }</span>
						</StyledLi>
					) ) }
				</StyledUl>
			}
			first
		/>
	);
};

export const PlanUSPS: React.FC< Props > = ( {
	pluginSlug,
	shouldUpgrade,
	isFreePlan,
	billingPeriod,
} ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isPreInstalledPlugin = ! isJetpack && PREINSTALLED_PLUGINS.includes( pluginSlug );

	const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;
	const supportText = usePluginsSupportText();
	const requiredPlan = useRequiredPlan( shouldUpgrade );
	const planDisplayCost = useSelector( ( state ) => {
		return getProductDisplayCost( state, requiredPlan || '' );
	} );
	const monthlyLabel = translate( 'month' );
	const annualLabel = translate( 'year' );
	const periodicityLabel = isAnnualPeriod ? annualLabel : monthlyLabel;

	if ( ! shouldUpgrade ) {
		return null;
	}

	let planText;
	switch ( requiredPlan ) {
		case PLAN_PERSONAL:
		case PLAN_PERSONAL_MONTHLY:
			planText = translate(
				'Included in the %(personalPlanName)s plan (%(cost)s/%(periodicity)s):',
				{
					args: {
						personalPlanName: getPlan( PLAN_PERSONAL )?.getTitle() as string,
						cost: planDisplayCost as string,
						periodicity: periodicityLabel,
					},
				}
			);
			break;
		case PLAN_BUSINESS:
		case PLAN_BUSINESS_MONTHLY:
			planText = translate(
				'Included in the %(businessPlanName)s plan (%(cost)s/%(periodicity)s):',
				{
					args: {
						businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() as string,
						cost: planDisplayCost as string,
						periodicity: periodicityLabel,
					},
				}
			);
			break;
		case PLAN_ECOMMERCE_TRIAL_MONTHLY:
			planText = translate( 'Included in ecommerce plans:' );
			break;
	}

	const preInstalledPluginUSPS = [
		translate( 'Remove WordPress.com ads' ),
		translate( 'Collect payments' ),
		translate( 'Earn ad revenue' ),
		translate( 'Premium themes' ),
		translate( 'Google Analytics integration' ),
		translate( 'Advanced SEO (Search Engine Optimisation) tools' ),
		translate( 'Automated site backups and one-click restore' ),
		translate( 'SFTP (SSH File Transfer Protocol) and Database Access' ),
	];
	const filteredUSPS = [
		...( isFreePlan && isAnnualPeriod ? [ translate( 'Free domain for one year' ) ] : [] ),
		translate( 'Best-in-class hosting' ),
		supportText,
		...( isPreInstalledPlugin ? preInstalledPluginUSPS : [] ),
		...( requiredPlan === PLAN_ECOMMERCE_TRIAL_MONTHLY
			? [ translate( 'Tools for store management and growth' ) ]
			: [] ),
	];

	return (
		<PluginDetailsSidebarUSP
			id="marketplace-plan"
			title={ planText }
			description={
				<StyledUl>
					{ filteredUSPS.map( ( usp, i ) => (
						<StyledLi key={ `usps__-${ i }` }>
							<GreenIcon icon={ check } size={ 24 } />
							<span>{ usp }</span>
						</StyledLi>
					) ) }
				</StyledUl>
			}
			first
		/>
	);
};

export default USPS;
