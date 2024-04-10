import { type PlanSlug, PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
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

	return (
		<>
			{ paidDomainName && (
				<DomainName>
					<div>{ paidDomainName }</div>
					<FreeDomainText>{ translate( 'Free for one year' ) }</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planSlug={ PLAN_PERSONAL }
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
				planSlug={ PLAN_PREMIUM }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
		</>
	);
}
