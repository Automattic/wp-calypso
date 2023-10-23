import { PlanSlug, getPlan } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
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
	const planPrice = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		const rawPlanPrices = getPlanPrices( state, {
			planSlug: suggestedPlanSlug,
			siteId,
			returnMonthly: true,
		} );
		return ( rawPlanPrices.discountedRawPrice || rawPlanPrices.rawPrice ) ?? 0;
	} );
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
							planPrice: formatCurrency( planPrice, currencyCode, { stripZeros: true } ),
						},
					} ) }
			</StyledButton>
		</>
	);
}
