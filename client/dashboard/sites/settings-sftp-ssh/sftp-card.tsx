import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
	Text,
	TextControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { siteSftpUsersResetPasswordMutation } from '../../app/queries';
import type { SftpUser } from '../../data/types';

const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = '22';

export default function SftpCard( {
	siteSlug,
	sftpUsers,
}: {
	siteSlug: string;
	sftpUsers: SftpUser[];
} ) {
	const { username, password } = sftpUsers[ 0 ];
	const mutation = useMutation( siteSftpUsersResetPasswordMutation( siteSlug ) );
	const { createErrorNotice } = useDispatch( noticesStore );

	const handleCreatePassword = () => {
		mutation.mutate( username, {
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
				<VStack spacing={ 5 }>
					<VStack>
						<Text>{ __( 'SFTP' ) }</Text>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'Use the credentials below to access and edit your website files using an SFTP client. <link>Learn more</link>.'
								),
								{
									// @ts-expect-error children prop is injected by createInterpolateElement
									link: <ExternalLink href="#" />,
								}
							) }
						</Text>
					</VStack>
					<VStack spacing={ 4 }>
						{ /* TODO: Handle copy and hide the input of the password if empty */ }
						<TextControl
							label={ __( 'URL' ) }
							value={ SFTP_URL }
							readonly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Port' ) }
							value={ SFTP_PORT }
							readonly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Username' ) }
							value={ username }
							readonly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Password' ) }
							value={ password }
							help={ __( 'To maintain security, you must reset your password to view it.' ) }
							readonly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						{ ! password && (
							<Button
								variant="primary"
								isBusy={ mutation.isPending }
								onClick={ handleCreatePassword }
							>
								{ __( 'Reset password' ) }
							</Button>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
