import { LoadingPlaceholder } from '@automattic/components';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	ButtonContainer,
	DialogContainer,
	Heading,
	SubHeading,
	Row,
	RowWithBorder,
	DomainName,
	StyledButton,
} from './components';
import SuggestedPlanSection from './components/suggested-plan-section';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';

export default function PaidPlanIsRequiredDialog( {
	paidDomainName,
	generatedWPComSubdomain,
	suggestedPlanSlug,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps & { paidDomainName: string } ) {
	const translate = useTranslate();
	const [ isBusy, setIsBusy ] = useState( false );

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'paid_plan_is_required',
		} );
	}, [] );

	function handlePaidPlanClick() {
		setIsBusy( true );
		onPlanSelected();
	}

	function handleFreeDomainClick() {
		setIsBusy( true );
		onFreePlanSelected();
	}

	return (
		<DialogContainer>
			<Heading id="plan-upsell-modal-title" shrinkMobileFont>
				{ translate( 'A paid plan is required for your domain.' ) }
			</Heading>
			<SubHeading id="plan-upsell-modal-description">
				{ translate(
					"Custom domains are only available with a paid plan. Choose annual billing and receive the domain's first year free."
				) }
			</SubHeading>
			<ButtonContainer>
				<RowWithBorder>
					<SuggestedPlanSection
						paidDomainName={ paidDomainName }
						suggestedPlanSlug={ suggestedPlanSlug }
						isBusy={ isBusy }
						onButtonClick={ handlePaidPlanClick }
					/>
				</RowWithBorder>
				<Row>
					<DomainName>
						{ generatedWPComSubdomain.isLoading && <LoadingPlaceholder /> }
						{ generatedWPComSubdomain.result && (
							<div>{ generatedWPComSubdomain.result.domain_name }</div>
						) }
					</DomainName>
					<StyledButton
						disabled={ generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result }
						busy={ isBusy }
						onClick={ handleFreeDomainClick }
					>
						{ translate( 'Continue with Free plan' ) }
					</StyledButton>
				</Row>
			</ButtonContainer>
		</DialogContainer>
	);
}
