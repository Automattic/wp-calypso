import { DataForm } from '@automattic/dataviews';
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
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { siteSftpUsersResetPasswordMutation } from '../../app/queries';
import ClipboardInputControl from './clipboard-input-control';
import type { SftpUser } from '../../data/types';
import type { Field } from '@automattic/dataviews';

const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = '22';

type SftpCardFormData = {
	url: string;
	port: string;
	username: string;
	password: string;
};

export default function SftpCard( {
	siteSlug,
	sftpUsers = [],
}: {
	siteSlug: string;
	sftpUsers: SftpUser[];
} ) {
	const { username = '', password = '' } = sftpUsers[ 0 ] ?? {};
	const mutation = useMutation( siteSftpUsersResetPasswordMutation( siteSlug ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const formData = {
		url: SFTP_URL,
		port: SFTP_PORT,
		username,
		password,
	};

	const handleCopy = ( label: string ) => {
		createSuccessNotice(
			sprintf(
				/* translators: %s is the copied field */
				__( 'Copied %s to clipboard.' ),
				label
			),
			{
				type: 'snackbar',
			}
		);
	};

	const ClipboardInputControlEdit = ( { field, data } ) => {
		const { getValue } = field;
		return (
			<ClipboardInputControl
				label={ field.label }
				value={ getValue( { item: data } ) }
				readOnly
				__next40pxDefaultSize
				onCopy={ handleCopy }
			/>
		);
	};

	const fields: Field< SftpCardFormData >[] = [
		{
			id: 'url',
			label: __( 'URL' ),
			Edit: ClipboardInputControlEdit,
		},
		{
			id: 'port',
			label: __( 'Port' ),
			Edit: ClipboardInputControlEdit,
		},
		{
			id: 'username',
			label: __( 'Username' ),
			Edit: ClipboardInputControlEdit,
		},
		{
			id: 'password',
			label: __( 'Password' ),
			Edit: ( { field, data } ) => {
				const { getValue } = field;
				const value = getValue( { item: data } );
				return value ? (
					<ClipboardInputControl
						label={ field.label }
						value={ value }
						help={ __(
							'Save your password somewhere safe. You will need to reset it to view it again.'
						) }
						readOnly
						__next40pxDefaultSize
						onCopy={ handleCopy }
					/>
				) : (
					<BaseControl
						label={ __( 'Password' ) }
						help={ __( 'To maintain security, you must reset your password to view it.' ) }
						__nextHasNoMarginBottom
						children={ null }
					/>
				);
			},
		},
	];

	const form = {
		type: 'regular' as const,
		fields: [ 'url', 'port', 'username', 'password' ],
	};

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
				<VStack style={ { paddingBottom: '12px' } }>
					<Text size="15px" weight={ 500 } lineHeight="32px">
						{ __( 'SFTP' ) }
					</Text>
					<Text variant="muted" as="p">
						{ createInterpolateElement(
							__(
								'Use the credentials below to access and edit your website files using an SFTP client. <link>Learn more</link>.'
							),
							{
								link: <ExternalLink href="#" children={ null } />,
							}
						) }
					</Text>
				</VStack>
				<VStack spacing={ 4 } style={ { padding: '8px 0' } }>
					<DataForm< SftpCardFormData > data={ formData } fields={ fields } form={ form } />
				</VStack>
				{ ! password && (
					<HStack style={ { padding: '8px 0' } }>
						<Button
							variant="secondary"
							isBusy={ mutation.isPending }
							onClick={ handleCreatePassword }
						>
							{ __( 'Reset password' ) }
						</Button>
					</HStack>
				) }
			</CardBody>
		</Card>
	);
}
