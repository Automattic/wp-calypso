import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
			<VStack className="woopayments-dashboard-empty-state__step" spacing={ 3 }>
				<Heading level={ 4 }>{ __( 'How do I start?' ) }</Heading>
				<Card>
					<CardBody>
						<HStack justify="space-between">
							<VStack spacing={ 1 }>
								<Text weight={ 600 }>{ __( 'Add WooPayments to a site for free' ) }</Text>
								<Text variant="muted">{ __( 'Start by picking the site' ) }</Text>
							</VStack>
							<AddWooPaymentsToSite />
						</HStack>
					</CardBody>
				</Card>
			</VStack>
			<VStack
				className="woopayments-dashboard-empty-state__step"
				spacing={ 2 }
				alignment="flex-start"
			>
				<Heading level={ 4 }>{ __( 'Learn more about the program' ) }</Heading>
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
			</VStack>
		</div>
	);
};

export default WooPaymentsDashboardEmptyState;
