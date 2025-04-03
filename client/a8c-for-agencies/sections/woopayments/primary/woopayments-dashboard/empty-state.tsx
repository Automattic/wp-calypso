import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddWooPaymentsToSite from '../../add-woopayments-to-site';

const WooPaymentsDashboardEmptyState = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<div className="woopayments-dashboard-empty-state__content">
			<img src={ wooPaymentsLogo } alt="WooPayments" />
			<div>
				<div className="woopayments-dashboard-empty-state__heading">
					{ translate( 'Earn revenue share when clients use WooPayments' ) }
				</div>
				<div className="woopayments-dashboard-empty-state__description">
					{ translate(
						'When new clients sign up to use the WooPayments gateway on WooCommerce stores that you build or manage for them, you will receive a revenue share of 5 basis points on the Total Payments Volume (“TPV”).'
					) }
				</div>
			</div>
			<StepSection heading={ translate( 'How do I start?' ) }>
				<StepSectionItem
					heading={ translate( 'Add WooPayments to a site for free' ) }
					description={ translate( 'Start by picking the site' ) }
				>
					<div className="woopayments-dashboard-empty-state__button">
						<AddWooPaymentsToSite />
					</div>
				</StepSectionItem>
			</StepSection>
			<StepSection heading={ translate( 'Learn more about the program' ) }>
				<ExternalLink
					onClick={ () => {
						dispatch(
							recordTracksEvent( 'calypso_a4a_woopayments_learn_more_about_program_click' )
						);
					} }
					href="https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/"
				>
					{ translate( 'Checkout the full details in the Knowledge Base' ) }
				</ExternalLink>
			</StepSection>
		</div>
	);
};

export default WooPaymentsDashboardEmptyState;
