import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import Notice from '../../../components/notice';
import { isSubdomain } from '../../../utils/domain';
import { StepName, type StepComponentProps } from '../types';

export function AdvancedStart( { domainName, setPage, onNextStep }: StepComponentProps ) {
	const isSubdomainFlow = isSubdomain( domainName );
	const firstStep = isSubdomainFlow ? StepName.SUBDOMAIN_SUGGESTED_START : StepName.SUGGESTED_START;
	const switchToSuggestedSetup = () => setPage( firstStep );

	const message = isSubdomainFlow
		? __(
				'This is the advanced way to connect your subdomain, using A & CNAME records. We advise using our <a>suggested setup</a> instead, with NS records.'
		  )
		: __(
				'This is the advanced way to connect your domain, using root A records & CNAME records. We advise using our <a>suggested setup</a> instead, with WordPress.com name servers.'
		  );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text variant="muted" lineHeight="20px" as="p">
							{ createInterpolateElement( message, {
								a: <Button variant="link" onClick={ switchToSuggestedSetup } />,
							} ) }
						</Text>

						<Notice variant="info" title={ __( 'How long will it take?' ) }>
							{ __( 'It takes 5–15 minutes to set up.' ) }
							<br />
							{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
						</Notice>
						<HStack justify="flex-start">
							<Button __next40pxDefaultSize variant="primary" onClick={ onNextStep }>
								{ __( 'Start setup' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
