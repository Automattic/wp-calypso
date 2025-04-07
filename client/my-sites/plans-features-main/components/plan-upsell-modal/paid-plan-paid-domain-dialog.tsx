import { LoadingPlaceholder } from '@automattic/components';
import { PlanButton } from '@automattic/plans-grid-next';
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
} from './components';
import PaidDomainSuggestedPlanSection from './components/paid-domain-suggested-plan-section';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';

export function PaidPlanPaidDomainDialog( {
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
				{ translate( 'Paid plan required' ) }
			</Heading>
			<SubHeading id="plan-upsell-modal-description">
				{ translate(
					'To transfer your domain, you’ll need a paid plan. Choose annual billing and get the domain free for a year.'
				) }
			</SubHeading>
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
