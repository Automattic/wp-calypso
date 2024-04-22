import {
	type PlanSlug,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useExperiment } from 'calypso/lib/explat';
import PlanUpsellButton from './plan-upsell-button';
import { DomainName } from '.';

const FreeDomainText = styled.div`
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.15px;
	color: var( --studio-green-50 );
	margin-top: 4px;
`;

function SuggestedPlanExplorerCreator( {
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
					<FreeDomainText>
						{ translate( 'Free domain and premium themes included.' ) }
					</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planSlug={ PLAN_PREMIUM }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
			{ paidDomainName && (
				<DomainName>
					<div>{ paidDomainName }</div>
					<FreeDomainText>
						{ translate( 'Best for developers. Free domain and plugins.' ) }
					</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planSlug={ PLAN_BUSINESS }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
		</>
	);
}

function SuggestedPlanStarterExplorerCreator( {
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
					<FreeDomainText>{ translate( 'Free domain for one year included.' ) }</FreeDomainText>
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
						{ translate( 'Free domain and premium themes included.' ) }
					</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planSlug={ PLAN_PREMIUM }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
			{ paidDomainName && (
				<DomainName>
					<div>{ paidDomainName }</div>
					<FreeDomainText>
						{ translate( 'Best for developers. Free domain and plugins.' ) }
					</FreeDomainText>
				</DomainName>
			) }
			<PlanUpsellButton
				planSlug={ PLAN_BUSINESS }
				onPlanSelected={ onPlanSelected }
				isBusy={ isBusy }
			/>
		</>
	);
}

export default function SuggestedPlanSection( props: {
	paidDomainName?: string;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
	isBusy: boolean;
} ) {
	const translate = useTranslate();
	const { paidDomainName, onPlanSelected, isBusy } = props;
	const [ isExperimentLoading, assignment ] = useExperiment(
		'calypso_signup_onboarding_plans_paid_domain_free_plan_modal_optimization'
	);

	if ( isExperimentLoading ) {
		return null;
	}

	if ( assignment?.variationName === 'creator_for_starter' ) {
		return <SuggestedPlanExplorerCreator { ...props } />;
	} else if ( assignment?.variationName === 'creator_and_free_link' ) {
		return <SuggestedPlanStarterExplorerCreator { ...props } />;
	}

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
