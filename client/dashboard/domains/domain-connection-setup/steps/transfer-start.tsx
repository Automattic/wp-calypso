import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import Notice from '../../../components/notice';
import { TransferStepComponentProps } from '../types';

export function TransferStart( {
	onNextStep,
	inboundTransferStatusInfo,
	domainName,
}: TransferStepComponentProps ) {
	const isDomainTransferrable =
		! inboundTransferStatusInfo?.in_redemption &&
		inboundTransferStatusInfo?.transfer_eligible_date === null;

	return (
		<VStack spacing={ 6 }>
			{ ! isDomainTransferrable && (
				<Notice variant="error">
					{ sprintf(
						/* translators: %s: the domain name that is being transferred (ex.: example.com) */
						__( 'The domain %s is not transferable.' ),
						domainName
					) }
				</Notice>
			) }
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ __(
								'For this setup you will need to log in to your current domain provider and go through a few steps.'
							) }
						</Text>

						<Notice variant="info" title={ __( 'How long will it take?' ) }>
							{ __( 'It takes 10–20 minutes to set up.' ) }
							<br />
							{ __(
								'It can take up to 5 days for the domain to be transferred, depending on your provider.'
							) }
						</Notice>

						<HStack justify="flex-start">
							<Button variant="primary" onClick={ onNextStep } disabled={ ! isDomainTransferrable }>
								{ __( 'Start setup' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
