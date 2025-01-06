import { type PlanSlug, PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { useHasEnTranslation } from '@automattic/i18n-utils';
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

/**
 * List the suggested plans only for the paid domain.
 */
export default function PaidDomainSuggestedPlanSection( props: {
	paidDomainName?: string;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
	isBusy: boolean;
} ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const { paidDomainName, onPlanSelected, isBusy } = props;

	const previousCopy = translate( 'Free for one year. Includes Premium themes.' );
	const updatedCopy = translate( 'Free for one year, includes Premium themes' );
	const hasTranslationForUpdatedCopy = hasEnTranslation(
		'Free for one year, includes Premium themes'
	);

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
						{ hasTranslationForUpdatedCopy ? updatedCopy : previousCopy }
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
