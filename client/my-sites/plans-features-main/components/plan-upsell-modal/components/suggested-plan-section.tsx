import { PlanSlug, getPlan } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getDiscountedRawPrice, getPlanRawPrice } from 'calypso/state/plans/selectors';
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
	const plan = getPlan( suggestedPlanSlug );
	const planTitle = plan?.getTitle();
	const productId = plan?.getProductId();
	const planPrice = useSelector( ( state ) => {
		const discountedRawPrice = productId
			? getDiscountedRawPrice( state, productId, true, true )
			: null;
		const rawPrice = productId ? getPlanRawPrice( state, productId, true, true ) : null;
		return ( discountedRawPrice || rawPrice ) ?? 0;
	} );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

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
