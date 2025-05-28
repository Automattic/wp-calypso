import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
	Panel,
	PanelBody,
	PanelRow,
	Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { siteSftpUsersCreateMutation } from '../../app/queries';

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
						'Sorry, we had a problem retrieving your sftp user details. Please refresh the page and try again.'
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
				<VStack>
					<Text as="p">
						{ canUseSsh
							? __(
									"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client. Optionally, enable SSH to perform advanced site operations using the command line."
							  )
							: __(
									"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client."
							  ) }
					</Text>
					<Panel>
						<PanelBody title={ __( 'What is SFTP?' ) }>
							<PanelRow>
								{ createInterpolateElement(
									__(
										'SFTP stands for Secure File Transfer Protocol (or SSH File Transfer Protocol). It’s a secure way for you to access your website files on your local computer via a client program such as <filezillaLink>Filezilla</filezillaLink>. ' +
											'For more information see <supportLink>SFTP on WordPress.com</supportLink>.'
									),
									{
										// @ts-expect-error children prop is injected by createInterpolateElement
										filezillaLink: <ExternalLink icon target="_blank" href={ FILEZILLA_URL } />,
										supportLink: <ExternalLink href="#hosting-sftp" />,
									}
								) }
							</PanelRow>
						</PanelBody>
						{ canUseSsh && (
							<PanelBody title={ __( 'What is SSH?' ) }>
								<PanelRow>
									{ createInterpolateElement(
										__(
											'SSH stands for Secure Shell. It’s a way to perform advanced operations on your site using the command line. For more information see <supportLink>Connect to SSH on WordPress.com</supportLink>.'
										),
										{
											supportLink: <ExternalLink href="#hosting-connect-to-ssh" />,
										}
									) }
								</PanelRow>
							</PanelBody>
						) }
					</Panel>
					<Text as="p">
						{ createInterpolateElement(
							__(
								'<strong>Ready to access your website files?</strong> Keep in mind, if mistakes happen you can restore your last backup, but will lose changes made after the backup date.'
							),
							{
								strong: <strong />,
							}
						) }
					</Text>
					<Button
						variant="primary"
						isBusy={ mutation.isPending }
						onClick={ handleCreateCredentials }
					>
						{ __( 'Create credentials' ) }
					</Button>
				</VStack>
			</CardBody>
		</Card>
	);
}
