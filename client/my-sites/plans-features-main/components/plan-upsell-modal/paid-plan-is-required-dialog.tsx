import { LoadingPlaceholder } from '@automattic/components';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlanButton from 'calypso/my-sites/plans-grid/components/plan-button';
import {
	ButtonContainer,
	DialogContainer,
	Heading,
	SubHeading,
	Row,
	RowWithBorder,
	DomainName,
} from './components';
import SuggestedPlanSection from './components/suggested-plan-section';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';

export default function PaidPlanIsRequiredDialog( {
	paidDomainName,
	generatedWPComSubdomain,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps ) {
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
	}

	return (
		<DialogContainer>
			<Heading id="plan-upsell-modal-title" shrinkMobileFont>
				{ translate( 'A paid plan is required for your domain.' ) }
			</Heading>
			<SubHeading id="plan-upsell-modal-description">
				{ translate(
					'Custom domains are only available with a paid plan. And they are free for the first year with an annual paid plan.'
				) }
			</SubHeading>
			<ButtonContainer>
				<RowWithBorder>
					<SuggestedPlanSection
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
