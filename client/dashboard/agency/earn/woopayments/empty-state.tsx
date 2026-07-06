import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody } from '../../../components/card';
import AddWooPaymentsToSite from './add-woopayments-to-site';

import './empty-state.scss';

const WOOPAYMENTS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

export default function WooPaymentsDashboardEmptyState() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<VStack className="woopayments-dashboard-empty-state" spacing={ 6 }>
			<img
				className="woopayments-dashboard-empty-state__logo"
				src={ wooPaymentsLogo }
				alt="WooPayments"
			/>

			<VStack spacing={ 2 }>
				<Heading level={ 2 }>{ __( 'Earn Revenue Share when clients use WooPayments' ) }</Heading>
				<Text className="woopayments-dashboard-empty-state__description">
					{ __(
						'When new clients sign up to use the WooPayments gateway on WooCommerce stores that you build or manage for them, you will receive a revenue share of 5 basis points on the Total Payments Volume (“TPV”).'
					) }
				</Text>
			</VStack>

			<VStack spacing={ 3 }>
				<Heading level={ 3 }>{ __( 'How do I start?' ) }</Heading>
				<Card>
					<CardBody>
						<HStack justify="space-between">
							<VStack spacing={ 1 }>
								<Text weight={ 600 }>{ __( 'Add WooPayments to a site for free' ) }</Text>
								<Text variant="muted">{ __( 'Start by picking the site' ) }</Text>
							</VStack>
							<AddWooPaymentsToSite excludedSiteIds={ [] } />
						</HStack>
					</CardBody>
				</Card>
			</VStack>

			<VStack spacing={ 2 } alignment="flex-start">
				<Heading level={ 3 }>{ __( 'Learn more about the program' ) }</Heading>
				<Button
					variant="link"
					href={ WOOPAYMENTS_LEARN_MORE_LINK }
					target="_blank"
					onClick={ () =>
						recordTracksEvent( 'calypso_a4a_woopayments_learn_more_about_program_click' )
					}
				>
					{ __( 'Check out the full details in the Knowledge Base' ) }
				</Button>
			</VStack>
		</VStack>
	);
}
