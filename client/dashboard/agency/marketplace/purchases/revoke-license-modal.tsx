import { activeAgencyQuery, jetpackAgencyLicenseRevokeMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import {
	getLicenseProductName,
	getLicenseStatus,
	getSiteHostname,
	isBundleParent,
	isChildLicense,
} from './license-status';
import type { JetpackLicense } from '@automattic/api-core';

interface Props {
	license: JetpackLicense;
	closeModal?: () => void;
}

export default function RevokeLicenseModal( { license, closeModal }: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const revoke = useMutation( jetpackAgencyLicenseRevokeMutation( agency?.id ) );

	const isBundle = isBundleParent( license );
	const isAssignedChild = isChildLicense( license ) && getLicenseStatus( license ) === 'assigned';
	const [ isPressableConfirmStep, setIsPressableConfirmStep ] = useState( false );

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_license_list_revoke_dialog_open' );
	}, [ recordTracksEvent ] );

	// TODO: classic collects churn feedback here and offers a call with the partner
	// manager before revoking.
	const handleRevoke = () => {
		// Classic only asks a second time for the Pressable plan itself.
		if ( license.license_key.startsWith( 'pressable-' ) && ! isPressableConfirmStep ) {
			setIsPressableConfirmStep( true );
			return;
		}
		recordTracksEvent( 'calypso_a4a_license_list_revoke_dialog_revoke' );
		revoke.mutate( license.license_key, {
			onSuccess: () => {
				createSuccessNotice(
					isBundle ? __( 'The bundle has been revoked.' ) : __( 'The license has been revoked.' ),
					{ type: 'snackbar' }
				);
				closeModal?.();
			},
			onError: ( error: Error ) =>
				createErrorNotice(
					error.message || __( 'Failed to revoke the license. Please try again.' ),
					{ type: 'snackbar' }
				),
		} );
	};

	if ( isPressableConfirmStep ) {
		return (
			<VStack spacing={ 6 }>
				<Heading level={ 2 } size={ 15 } weight={ 500 }>
					{ __( 'Are you sure you want to revoke your Pressable plan?' ) }
				</Heading>
				<Text>
					{ __(
						'If you continue to revoke, you will lose access to all of your Pressable sites. Are you sure you want to proceed?'
					) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => setIsPressableConfirmStep( false ) }
						disabled={ revoke.isPending }
					>
						{ __( 'Go back' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isDestructive
						isBusy={ revoke.isPending }
						disabled={ revoke.isPending }
						onClick={ handleRevoke }
					>
						{ __( 'Revoke Pressable plan license' ) }
					</Button>
				</ButtonStack>
			</VStack>
		);
	}

	const getRevokeMessage = () => {
		if ( isBundle ) {
			return createInterpolateElement(
				__(
					'Revoking this bundle will cause <productName /> to stop working on your <count /> assigned sites.'
				),
				{
					productName: <strong>{ getLicenseProductName( license ) }</strong>,
					count: <>{ license.quantity ?? 0 }</>,
				}
			);
		}
		if ( isAssignedChild ) {
			return createInterpolateElement(
				__(
					'This license will be revoked from <siteUrl />, and a new <productName /> license will be created and added to the bundle.'
				),
				{
					siteUrl: <strong>{ getSiteHostname( license.siteurl ?? '' ) }</strong>,
					productName: <strong>{ getLicenseProductName( license ) }</strong>,
				}
			);
		}
		return __(
			'A revoked license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
		);
	};

	return (
		<VStack spacing={ 6 }>
			<Text>{ getRevokeMessage() }</Text>
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						{ license.siteurl && (
							<Text>
								<strong>{ __( 'Site:' ) }</strong> { getSiteHostname( license.siteurl ) }
							</Text>
						) }
						<Text>
							<strong>{ __( 'Product:' ) }</strong> { getLicenseProductName( license ) }
						</Text>
						<Text>
							<strong>{ __( 'License:' ) }</strong>{ ' ' }
							<code style={ { wordBreak: 'break-all' } }>{ license.license_key }</code>
						</Text>
					</VStack>
				</CardBody>
			</Card>
			<Text variant="muted">{ __( 'Please note this action cannot be undone.' ) }</Text>
			<ButtonStack justify="flex-end">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ revoke.isPending }
				>
					{ __( 'Go back' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					isBusy={ revoke.isPending }
					disabled={ revoke.isPending }
					onClick={ handleRevoke }
				>
					{ isBundle ? __( 'Revoke bundle' ) : __( 'Revoke license' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
