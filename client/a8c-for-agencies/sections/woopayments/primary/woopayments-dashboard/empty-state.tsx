import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddWooPaymentsToSite from '../../add-woopayments-to-site';

const WooPaymentsDashboardEmptyState = () => {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	return (
		<div className="woopayments-dashboard-empty-state__content">
			<img src={ wooPaymentsLogo } alt="WooPayments" />
			<div>
				<div className="woopayments-dashboard-empty-state__heading">
					{ __( 'Earn Revenue Share when clients use WooPayments' ) }
				</div>
				<div className="woopayments-dashboard-empty-state__description">
					{ __(
						'When new clients sign up to use the WooPayments gateway on WooCommerce stores that you build or manage for them, you will receive a revenue share of 5 basis points on the Total Payments Volume (“TPV”).'
					) }
				</div>
			</div>
			<StepSection heading={ __( 'How do I start?' ) }>
				<StepSectionItem
					heading={ __( 'Add WooPayments to a site for free' ) }
					description={ __( 'Start by picking the site' ) }
				>
					<div className="woopayments-dashboard-empty-state__button">
						<AddWooPaymentsToSite />
					</div>
				</StepSectionItem>
			</StepSection>
			<StepSection heading={ __( 'Learn more about the program' ) }>
				<Button
					variant="link"
					onClick={ () => {
						dispatch(
							recordTracksEvent( 'calypso_a4a_woopayments_learn_more_about_program_click' )
						);
						showSupportGuide(
							'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/'
						);
					} }
				>
					{ __( 'Check out the full details in the Knowledge Base' ) }
				</Button>
			</StepSection>
		</div>
	);
};

export default WooPaymentsDashboardEmptyState;
