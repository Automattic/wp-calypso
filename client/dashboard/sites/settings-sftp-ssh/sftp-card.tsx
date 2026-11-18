import {
	siteSftpUsersDeleteMutation,
	siteSftpUsersResetPasswordMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
	BaseControl,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import React, { useEffect, useState } from 'react';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import ClipboardInputControl from '../../components/clipboard-input-control';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import type { SftpUser } from '@automattic/api-core';
import type { DataFormControlProps, Field } from '@wordpress/dataviews';

const SFTP_URL = 'sftp.wp.com';

const SFTP_PORT = '22';

const RESET_PASSWORD_RATE_LIMIT_MILLISECONDS = 60 * 1000;

const noop = () => {};

type SftpCardFormData = {
	url: string;
	port: string;
	username: string;
	password: string;
};

export default function SftpCard( {
	siteId,
	sftpUsers = [],
}: {
	siteId: number;
	sftpUsers: SftpUser[];
} ) {
	const { username = '', password = '' } = sftpUsers[ 0 ] ?? {};
	const mutation = useMutation( siteSftpUsersResetPasswordMutation( siteId ) );
	const disableMutation = useMutation(
		withSnackbar( siteSftpUsersDeleteMutation( siteId ), {
			success: __( 'SFTP disabled.' ),
			error: __( 'Failed to disable SFTP. Please refresh the page and try again.' ),
		} )
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ showResetPasswordConfirmDialog, setShowResetPasswordConfirmDialog ] = useState( false );
	const [ showDisableConfirmDialog, setShowDisableConfirmDialog ] = useState( false );
	const [ isResetPasswordRateLimited, setIsResetPasswordRateLimited ] = useState( false );
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
				String( label )
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
		layout: { type: 'regular' as const },
		fields: [ 'url', 'port', 'username', 'password' ],
	};

	const handleConfirmResetPassword = () => {
		setIsResetPasswordRateLimited( true );
		mutation.mutate( username, {
			onError: () => {
				setIsResetPasswordRateLimited( false );
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

	const handleConfirmDisable = () => {
		disableMutation.mutate( username );
		setShowDisableConfirmDialog( false );
	};

	useEffect( () => {
		if ( ! isResetPasswordRateLimited ) {
			return;
		}

		const timeoutId = window.setTimeout(
			() => setIsResetPasswordRateLimited( false ),
			RESET_PASSWORD_RATE_LIMIT_MILLISECONDS
		);

		return () => window.clearTimeout( timeoutId );
	}, [ isResetPasswordRateLimited ] );

	const resetPasswordLabel = __( 'Reset password' );
	const resetPasswordDescription = isResetPasswordRateLimited
		? __( 'You reset the password recently. Please wait a minute and try again.' )
		: undefined;
	const resetPasswordButton = (
		<Button
			variant="secondary"
			isBusy={ mutation.isPending }
			disabled={ mutation.isPending || isResetPasswordRateLimited }
			accessibleWhenDisabled
			label={ resetPasswordLabel }
			description={ resetPasswordDescription }
			showTooltip={ isResetPasswordRateLimited }
			onClick={ () => setShowResetPasswordConfirmDialog( true ) }
		>
			{ resetPasswordLabel }
		</Button>
	);

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'SFTP' ) }
						description={ createInterpolateElement(
							__(
								'Use the credentials below to access and edit your website files using an SFTP client. <learnMoreLink />'
							),
							{
								learnMoreLink: <InlineSupportLink supportContext="hosting-sftp" />,
							}
						) }
						level={ 3 }
					/>
					<DataForm< SftpCardFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ noop }
					/>
					<ButtonStack justify="flex-start">
						{ resetPasswordButton }
						<Button
							__next40pxDefaultSize
							variant="secondary"
							isDestructive
							isBusy={ disableMutation.isPending }
							disabled={ disableMutation.isPending }
							accessibleWhenDisabled
							onClick={ () => setShowDisableConfirmDialog( true ) }
						>
							{ __( 'Disable SFTP' ) }
						</Button>
					</ButtonStack>
				</VStack>
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
			<ConfirmDialog
				isOpen={ showDisableConfirmDialog }
				confirmButtonText={ __( 'Disable SFTP' ) }
				size="small"
				onConfirm={ () => handleConfirmDisable() }
				onCancel={ () => setShowDisableConfirmDialog( false ) }
			>
				{ __(
					'Disabling SFTP deletes your SFTP credentials, so SFTP clients, deployment tools, and scripts that use them will stop connecting. SSH access is turned off too. You can enable SFTP again at any time and get a new password.'
				) }
			</ConfirmDialog>
		</Card>
	);
}
