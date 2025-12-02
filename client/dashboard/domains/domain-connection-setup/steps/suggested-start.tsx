import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Panel,
	PanelBody,
	PanelRow,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { caution } from '@wordpress/icons';
import { Card, CardBody } from '../../../components/card';
import Notice from '../../../components/notice';
import { isSubdomain } from '../../../utils/domain';
import { StepName, type StepComponentProps } from '../types';

export function SuggestedStart( { domainName, setPage, onNextStep }: StepComponentProps ) {
	const isSubdomainFlow = isSubdomain( domainName );
	const firstStep = isSubdomainFlow ? StepName.SUBDOMAIN_ADVANCED_START : StepName.ADVANCED_START;
	const switchToAdvancedSetup = () => setPage( firstStep );
	const navigate = useNavigate();
	const navigateToDNSOverviewPage = () => {
		navigate( {
			to: '/domains/$domainName/dns',
			params: { domainName },
		} );
	};

	const message = isSubdomainFlow
		? __(
				'The easiest way to connect your subdomain is by changing NS records. But if you are unable to do this, then switch to our <a>advanced setup</a>, using A & CNAME records.'
		  )
		: __(
				'This is the easiest way to connect your domain, using name servers. If needed you can also use our <a>advanced setup</a>, using root A & CNAME records.'
		  );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text variant="muted" as="p">
							{ createInterpolateElement( message, {
								a: <Button variant="link" onClick={ switchToAdvancedSetup } />,
							} ) }
						</Text>

						<Notice variant="info" title={ __( 'How long will it take?' ) }>
							{ __( 'It takes 5–15 minutes to set up.' ) }
							<br />
							{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
						</Notice>
						<Panel>
							<PanelBody
								title={ __( 'Do you have email or other services connected to this domain?' ) }
								icon={ caution }
								initialOpen={ false }
							>
								<PanelRow>
									<VStack spacing={ 4 }>
										<VStack spacing={ 2 }>
											<Text as="p" lineHeight="20px">
												{ createInterpolateElement(
													__(
														'If you have any email or services other than web hosting connected to this domain, we recommend you copy over your DNS records before proceeding with this setup to avoid disruptions. You can then start the setup again by going back to <em>Upgrades > Domains</em>.'
													),
													{
														em: <em />,
													}
												) }
											</Text>
											<HStack justify="flex-start">
												<Button
													__next40pxDefaultSize
													variant="secondary"
													onClick={ navigateToDNSOverviewPage }
												>
													{ __( 'Go to DNS records' ) }
												</Button>
											</HStack>
										</VStack>
										<VStack spacing={ 2 }>
											<Text as="p" lineHeight="20px">
												{ __(
													'Alternatively, you can continue to use your current DNS provider by adding the correct A records and CNAME records using our advanced setup.'
												) }
											</Text>
											<HStack justify="flex-start">
												<Button
													__next40pxDefaultSize
													variant="secondary"
													onClick={ switchToAdvancedSetup }
												>
													{ __( 'Switch to advanced setup' ) }
												</Button>
											</HStack>
										</VStack>
									</VStack>
								</PanelRow>
							</PanelBody>
						</Panel>
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
