import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	BaseControl,
	Button,
	Card,
	CardBody,
	ExternalLink,
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
						<Text size="15px" weight={ 500 } lineHeight="32px">
							{ __( 'SFTP' ) }
						</Text>
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
							readOnly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Port' ) }
							value={ SFTP_PORT }
							readOnly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<TextControl
							label={ __( 'Username' ) }
							value={ username }
							readOnly
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						{ password ? (
							<TextControl
								label={ __( 'Password' ) }
								value={ password }
								help={ __(
									'Save your password somewhere safe. You will need to reset it to view it again.'
								) }
								readOnly
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						) : (
							<BaseControl
								label={ __( 'Password' ) }
								help={ __( 'To maintain security, you must reset your password to view it.' ) }
								__nextHasNoMarginBottom
							/>
						) }
						{ ! password && (
							<HStack>
								<Button
									variant="secondary"
									isBusy={ mutation.isPending }
									onClick={ handleCreatePassword }
								>
									{ __( 'Reset password' ) }
								</Button>
							</HStack>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
