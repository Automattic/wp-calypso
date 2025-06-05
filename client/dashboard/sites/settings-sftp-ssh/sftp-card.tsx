import { DataForm } from '@automattic/dataviews';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
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
import React, { useState } from 'react';
import { siteSftpUsersResetPasswordMutation } from '../../app/queries';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { SectionHeader } from '../../components/section-header';
import type { SftpUser } from '../../data/types';
import type { DataFormControlProps, Field } from '@automattic/dataviews';

const SFTP_URL = 'sftp.wp.com';

const SFTP_PORT = '22';

const noop = () => {};

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
	const [ showResetPasswordConfirmDialog, setShowResetPasswordConfirmDialog ] = useState( false );
	const formData = {
		url: SFTP_URL,
		port: SFTP_PORT,
		username,
		password,
	};

	const handleCopy = ( label?: React.ReactNode ) => {
		if ( ! label ) {
			return;
		}

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

	const ClipboardInputControlEdit = < Item, >( { field, data }: DataFormControlProps< Item > ) => {
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
			label: __( 'port' ),
			Edit: ClipboardInputControlEdit,
		},
		{
			id: 'username',
			label: __( 'username' ),
			Edit: ClipboardInputControlEdit,
		},
		{
			id: 'password',
			label: __( 'password' ),
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
						label={ field.label }
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

	const handleConfirmResetPassword = () => {
		mutation.mutate( username, {
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

		setShowResetPasswordConfirmDialog( false );
	};

	return (
		<Card>
			<CardBody>
				<VStack style={ { paddingBottom: '12px' } }>
					<SectionHeader
						title={ __( 'SFTP' ) }
						description={ createInterpolateElement(
							__(
								'Use the credentials below to access and edit your website files using an SFTP client. <link>Learn more</link>.'
							),
							{
								link: <ExternalLink href="#" children={ null } />,
							}
						) }
						level={ 3 }
					/>
				</VStack>
				<VStack spacing={ 4 } style={ { padding: '8px 0' } }>
					<DataForm< SftpCardFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ noop }
					/>
				</VStack>
				{ ! password && (
					<HStack style={ { padding: '8px 0' } }>
						<Button
							variant="secondary"
							isBusy={ mutation.isPending }
							onClick={ () => setShowResetPasswordConfirmDialog( true ) }
						>
							{ __( 'Reset password' ) }
						</Button>
					</HStack>
				) }
			</CardBody>
			<ConfirmDialog
				isOpen={ showResetPasswordConfirmDialog }
				confirmButtonText={ __( 'Reset password' ) }
				size="small"
				onConfirm={ () => handleConfirmResetPassword() }
				onCancel={ () => setShowResetPasswordConfirmDialog( false ) }
			>
				{ __(
					'After resetting your password, be sure to update it in any SFTP clients, deployment tools, or scripts that use it to connect to your site.'
				) }
			</ConfirmDialog>
		</Card>
	);
}
