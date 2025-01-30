import { LoadingPlaceholder } from '@automattic/components';
import { OnboardSelect } from '@automattic/data-stores';
import { PlanButton } from '@automattic/plans-grid-next';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	ButtonContainer,
	DialogContainer,
	Heading,
	SubHeading,
	Row,
	RowWithBorder,
	DomainName,
} from './components';
import PaidDomainSuggestedPlanSection from './components/paid-domain-suggested-plan-section';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';

export function PaidPlanPaidDomainDialog( {
	paidDomainName,
	generatedWPComSubdomain,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps ) {
	const { setCreateWithBigSky } = useDispatch( ONBOARD_STORE );
	const createWithBigSky = useSelect( ( select: ( key: string ) => OnboardSelect ) => {
		const { getCreateWithBigSky } = select( ONBOARD_STORE );
		return getCreateWithBigSky();
	}, [] );

	const translate = useTranslate();
	const [ isBusy, setIsBusy ] = useState( false );

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'paid_plan_is_required',
		} );
	}, [] );

	function handleFreeDomainClick() {
		setIsBusy( true );
		onFreePlanSelected();

		if ( createWithBigSky ) {
			setCreateWithBigSky( false );
		}
	}

	const upsellDescription = createWithBigSky
		? ''
		: translate(
				"Custom domains are only available with a paid plan. Choose annual billing and receive the domain's first year free."
		  );

	const bigSkyHeader = paidDomainName
		? translate( 'Domains and our AI Website Builder are only available with a paid plan' )
		: translate( 'Our AI Website Builder is only available with a paid plan' );

	return (
		<DialogContainer>
			<Heading id="plan-upsell-modal-title" shrinkMobileFont>
				{ createWithBigSky
					? bigSkyHeader
					: translate( 'A paid plan is required for your domain.' ) }
			</Heading>
			<SubHeading id="plan-upsell-modal-description">{ upsellDescription }</SubHeading>
			<ButtonContainer>
				<RowWithBorder>
					<PaidDomainSuggestedPlanSection
						paidDomainName={ paidDomainName }
						isBusy={ isBusy }
						onPlanSelected={ onPlanSelected }
					/>
				</RowWithBorder>
				<Row>
					<DomainName>
						{ generatedWPComSubdomain.isLoading && <LoadingPlaceholder /> }
						{ generatedWPComSubdomain.result && (
							<div>{ generatedWPComSubdomain.result.domain_name }</div>
						) }
					</DomainName>
					<PlanButton
						disabled={ generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result }
						busy={ isBusy }
						onClick={ handleFreeDomainClick }
					>
						{ translate( 'Continue with Free plan' ) }
					</PlanButton>
				</Row>
			</ButtonContainer>
		</DialogContainer>
	);
}
