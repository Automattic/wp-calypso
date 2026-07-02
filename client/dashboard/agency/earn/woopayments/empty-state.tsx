import { localizeUrl } from '@automattic/i18n-utils';
import {
	Button,
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { Card, CardBody } from '../../../components/card';
import { Text } from '../../../components/text';
import type { RecordTracksEvent } from './types';

// Inlined from client/a8c-for-agencies so the dashboard has no dependency on the classic A4A app.
const WOOPAYMENTS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

function StepSection( { heading, children }: { heading: string; children: React.ReactNode } ) {
	return (
		<VStack spacing={ 3 }>
			<Text size={ 15 } weight={ 500 } as="h2">
				{ heading }
			</Text>
			{ children }
		</VStack>
	);
}

export default function WooPaymentsEmptyState( {
	onAddWooPayments,
	recordTracksEvent = () => {},
}: {
	onAddWooPayments?: () => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	return (
		<VStack spacing={ 6 }>
			<HStack alignment="flex-start" spacing={ 4 } wrap>
				<img src={ wooPaymentsLogo } alt="WooPayments" width={ 96 } />
				<VStack spacing={ 2 }>
					<Text size={ 21 } weight={ 500 } as="h1">
						{ __( 'Earn Revenue Share when clients use WooPayments' ) }
					</Text>
					<Text>
						{ __(
							'When new clients sign up to use the WooPayments gateway on WooCommerce stores that you build or manage for them, you will receive a revenue share of 5 basis points on the Total Payments Volume (“TPV”).'
						) }
					</Text>
				</VStack>
			</HStack>
			<StepSection heading={ __( 'How do I start?' ) }>
				<Card>
					<CardBody>
						<HStack alignment="center" spacing={ 4 } wrap>
							<VStack spacing={ 1 }>
								<Text weight={ 500 }>{ __( 'Add WooPayments to a site for free' ) }</Text>
								<Text variant="muted">{ __( 'Start by picking the site' ) }</Text>
							</VStack>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ () => {
									recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
									onAddWooPayments?.();
								} }
							>
								{ __( 'Add WooPayments to site' ) }
							</Button>
						</HStack>
					</CardBody>
				</Card>
			</StepSection>
			<StepSection heading={ __( 'Learn more about the program' ) }>
				<ExternalLink
					href={ localizeUrl( WOOPAYMENTS_LEARN_MORE_LINK ) }
					onClick={ () =>
						recordTracksEvent( 'calypso_a4a_woopayments_learn_more_about_program_click' )
					}
				>
					{ __( 'Check out the full details in the Knowledge Base' ) }
				</ExternalLink>
			</StepSection>
		</VStack>
	);
}
