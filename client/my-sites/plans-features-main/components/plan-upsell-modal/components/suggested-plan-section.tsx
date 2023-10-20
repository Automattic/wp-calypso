import { PlanSlug, getPlan } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import usePlanPrices from 'calypso/my-sites/plans/hooks/use-plan-prices';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { DomainName, StyledButton } from '.';

const FreeDomainText = styled.div`
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	color: var( --studio-green-50 );
	margin-top: 4px;
`;

export default function SuggestedPlanSection( {
	paidDomainName,
	suggestedPlanSlug,
	onButtonClick,
	isBusy,
}: {
	paidDomainName: string;
	suggestedPlanSlug: PlanSlug;
	onButtonClick: () => void;
	isBusy: boolean;
} ) {
	const translate = useTranslate();
	const planPrices = usePlanPrices( { planSlug: suggestedPlanSlug, returnMonthly: true } );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const planTitle = getPlan( suggestedPlanSlug )?.getTitle();

	return (
		<>
			<DomainName>
				<div>{ paidDomainName }</div>
				<FreeDomainText>{ translate( 'Free for one year' ) }</FreeDomainText>
			</DomainName>
			<StyledButton busy={ isBusy } primary onClick={ onButtonClick }>
				{ currencyCode &&
					translate( 'Get %(planTitle)s - %(planPrice)s/month', {
						comment: 'Eg: Get Personal - $4/month',
						args: {
							planTitle: planTitle as string,
							planPrice: formatCurrency(
								( planPrices.discountedRawPrice || planPrices.rawPrice ) ?? 0,
								currencyCode,
								{ stripZeros: true }
							),
						},
					} ) }
			</StyledButton>
		</>
	);
}
