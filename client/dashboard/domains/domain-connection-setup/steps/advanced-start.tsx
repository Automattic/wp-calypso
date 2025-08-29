import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isSubdomain } from '../../../../lib/domains';
import Notice from '../../../components/notice';
import Progress from '../components/progress';
import { stepSlug } from '../constants';
import type { StepComponentProps } from '../types';

export default function AdvancedStart( {
	domain,
	progressStepList,
	pageSlug,
	setPage,
	onNextStep,
	domainSetupInfo,
}: StepComponentProps ) {
	const { data } = domainSetupInfo || {};
	const isSubdomainFlow = isSubdomain( domain );

	const firstStep = isSubdomainFlow ? stepSlug.SUBDOMAIN_SUGGESTED_START : stepSlug.SUGGESTED_START;

	const switchToSuggestedSetup = () => setPage( firstStep );

	const message = isSubdomainFlow
		? __(
				'You can connect your subdomain using A & CNAME records. If your domain provider supports changing NS records, we recommend using our <a>suggested setup</a> instead.'
		  )
		: __(
				'Connect your domain using root A & CNAME records. If your domain provider supports changing name servers, we recommend using our <a>suggested setup</a> instead.'
		  );

	const showProgress = Object.keys( progressStepList ).includes( pageSlug );

	return (
		<VStack spacing={ 6 }>
			{ showProgress && <Progress steps={ progressStepList } currentStep={ pageSlug } /> }

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<p>
							{ createInterpolateElement( message, {
								a: <Button variant="link" onClick={ switchToSuggestedSetup } />,
							} ) }
						</p>

						<Notice variant="info" title={ __( 'How long will it take?' ) }>
							{ __( 'It takes 5 minutes to set up.' ) }
							<br />
							{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
						</Notice>

						{ data?.is_supported_tld && (
							<Card variant="secondary">
								<CardBody>
									<p>
										{ __(
											'We recommend transferring your domain instead of connecting it. This will make it easier to manage and will provide better performance.'
										) }
									</p>
								</CardBody>
							</Card>
						) }

						<HStack justify="flex-start">
							<Button variant="primary" onClick={ onNextStep }>
								{ __( 'Start setup' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
