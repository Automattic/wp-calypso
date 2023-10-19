import { localizeUrl } from '@automattic/i18n-utils';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { LoadingPlaceHolder } from '../loading-placeholder';
import {
	ButtonContainer,
	DialogContainer,
	Heading,
	Row,
	RowWithBorder,
	SubHeading,
	StyledButton,
	DomainName,
} from './components';
import SuggestedPlanSection from './components/suggested-plan-section';
import { DomainPlanDialogProps, MODAL_VIEW_EVENT_NAME } from '.';

export function FreePlanPaidDomainDialog( {
	paidDomainName,
	generatedWPComSubdomain,
	suggestedPlanSlug,
	onFreePlanSelected,
	onPlanSelected,
}: DomainPlanDialogProps & {
	paidDomainName: string;
} ) {
	const translate = useTranslate();
	const [ isBusy, setIsBusy ] = useState( false );

	useEffect( () => {
		recordTracksEvent( MODAL_VIEW_EVENT_NAME, {
			dialog_type: 'custom_domain_and_free_plan',
		} );
	}, [] );

	function handlePaidPlanClick() {
		setIsBusy( true );
		onPlanSelected();
	}

	function handleFreePlanClick() {
		setIsBusy( true );
		onFreePlanSelected( true );
	}

	return (
		<DialogContainer>
			<Heading id="plan-upsell-modal-title" shrinkMobileFont>
				{ translate( 'A paid plan is required for a custom primary domain.' ) }
			</Heading>
			<SubHeading id="plan-upsell-modal-description">
				{ translate(
					'Your custom domain can only be used as the primary domain with a paid plan and is free for the first year with an annual paid plan. For more details, please read {{a}}our support document{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/domains/set-a-primary-address/'
									) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
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
						{ generatedWPComSubdomain.isLoading && <LoadingPlaceHolder /> }
						{ generatedWPComSubdomain.result &&
							translate( '%(paidDomainName)s redirects to %(wpcomFreeDomain)s', {
								args: {
									paidDomainName,
									wpcomFreeDomain: generatedWPComSubdomain.result.domain_name,
								},
								comment: '%(wpcomFreeDomain)s is a WordPress.com subdomain, e.g. foo.wordpress.com',
							} ) }
					</DomainName>
					<StyledButton
						disabled={ generatedWPComSubdomain.isLoading || ! generatedWPComSubdomain.result }
						busy={ isBusy }
						onClick={ handleFreePlanClick }
					>
						{ translate( 'Continue with Free plan' ) }
					</StyledButton>
				</Row>
			</ButtonContainer>
		</DialogContainer>
	);
}
