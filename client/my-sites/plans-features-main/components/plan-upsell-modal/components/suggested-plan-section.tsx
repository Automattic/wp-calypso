import { type PlanSlug, PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { usePlanUpsellInfo } from '../hooks/use-plan-upsell-info';
import PlanUpsellButton from './plan-upsell-button';
import { DomainName } from '.';

const FreeDomainText = styled.div`
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	color: var( --studio-green-50 );
	margin-top: 4px;
`;

export default function SuggestedPlanSection( {
	paidDomainName,
	onPlanSelected,
	isBusy,
}: {
	paidDomainName?: string;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
	isBusy: boolean;
} ) {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? 'USD';
	const basicPlanUpsellInfo = usePlanUpsellInfo( PLAN_PERSONAL, currencyCode );
	const advancePlanUpsellInfo = usePlanUpsellInfo( PLAN_PREMIUM, currencyCode );

	return (
		<>
			{ paidDomainName && (
				<DomainName>
					<div>{ paidDomainName }</div>
					<FreeDomainText>{ translate( 'Free for one year' ) }</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planUpsellInfo={ basicPlanUpsellInfo }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
			{ paidDomainName && (
				<DomainName>
					<div>{ paidDomainName }</div>
					<FreeDomainText>
						{ translate( 'Free for one year. Includes Premium themes.' ) }
					</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planUpsellInfo={ advancePlanUpsellInfo }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
		</>
	);
}
