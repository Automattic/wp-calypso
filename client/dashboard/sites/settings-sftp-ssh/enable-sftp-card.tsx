import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	ExternalLink,
	Panel,
	PanelBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { siteSftpUsersCreateMutation } from '../../app/queries';
import { SectionHeader } from '../../components/section-header';

const FILEZILLA_URL = 'https://filezilla-project.org/';

export default function EnableSftpCard( {
	siteSlug,
	canUseSsh,
}: {
	siteSlug: string;
	canUseSsh: boolean;
} ) {
	const mutation = useMutation( siteSftpUsersCreateMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleCreateCredentials = () => {
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Credentials have been successfully created.' ), {
					type: 'snackbar',
				} );
			},
			onError: () => {
				createErrorNotice(
					__(
						'Sorry, we had a problem retrieving your SFTP user details. Please refresh the page and try again.'
					),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack style={ { paddingBottom: '12px' } }>
					<SectionHeader
						title={ __( 'Get started with SFTP/SSH' ) }
						description={
							canUseSsh
								? __(
										"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client. Optionally, enable SSH to perform advanced site operations using the command line."
								  )
								: __(
										"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client."
								  )
						}
						level={ 3 }
					/>
				</VStack>
				<VStack spacing={ 5 } style={ { padding: '8px 0' } }>
					{ /* TODO: Replace the Panel with the Accordion component when it's ready */ }
					<Panel>
						<PanelBody title={ __( 'What is SFTP?' ) } initialOpen={ false }>
							{ createInterpolateElement(
								__(
									'SFTP stands for Secure File Transfer Protocol (or SSH File Transfer Protocol). It’s a secure way for you to access your website files on your local computer via a client program such as <filezillaLink>Filezilla</filezillaLink>. ' +
										'For more information see <supportLink>SFTP on WordPress.com</supportLink>.'
								),
								{
									filezillaLink: <ExternalLink href={ FILEZILLA_URL } children={ null } />,
									supportLink: <ExternalLink href="#hosting-sftp" children={ null } />,
								}
							) }
						</PanelBody>
						{ canUseSsh && (
							<PanelBody title={ __( 'What is SSH?' ) } initialOpen={ false }>
								{ createInterpolateElement(
									__(
										'SSH stands for Secure Shell. It’s a way to perform advanced operations on your site using the command line. For more information see <supportLink>Connect to SSH on WordPress.com</supportLink>.'
									),
									{
										supportLink: <ExternalLink href="#hosting-connect-to-ssh" children={ null } />,
									}
								) }
							</PanelBody>
						) }
					</Panel>
					<Text variant="muted" size="12px" lineHeight="16px" as="p">
						{ createInterpolateElement(
							__(
								'<strong>Ready to access your website files?</strong> Keep in mind, if mistakes happen you can restore your last backup, but will lose changes made after the backup date.'
							),
							{
								strong: <strong />,
							}
						) }
					</Text>
				</VStack>
				<HStack justify="flex-start" style={ { padding: '8px 0' } }>
					<Button
						variant="primary"
						isBusy={ mutation.isPending }
						onClick={ handleCreateCredentials }
					>
						{ __( 'Create credentials' ) }
					</Button>
				</HStack>
			</CardBody>
		</Card>
	);
}
