import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { LoadingPlaceHolder } from '../loading-placeholder';
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
	wpcomFreeDomainSuggestion,
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
			<Heading>{ translate( 'A paid plan is required for your domain.' ) }</Heading>
			<SubHeading>
				{ translate(
					'Custom domains are only available with a paid plan. And they are free for the first year with an annual paid plan.'
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
						{ wpcomFreeDomainSuggestion.isLoading && <LoadingPlaceHolder /> }
						{ wpcomFreeDomainSuggestion.result && (
							<div>{ wpcomFreeDomainSuggestion.result.domain_name }</div>
						) }
					</DomainName>
					<StyledButton
						disabled={ wpcomFreeDomainSuggestion.isLoading || ! wpcomFreeDomainSuggestion.result }
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
