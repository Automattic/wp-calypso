import { JetpackCrmRequestError, type JetpackCrmExtension } from '@automattic/api-core';
import {
	jetpackCrmExtensionDownloadMutation,
	jetpackCrmExtensionsQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../../../app/breadcrumbs';
import { marketplacePurchasesCrmDownloadsRoute } from '../../../../app/router/agency';
import { ActionList } from '../../../../components/action-list';
import { Card, CardBody } from '../../../../components/card';
import ClipboardInputControl from '../../../../components/clipboard-input-control';
import EmptyState from '../../../../components/empty-state';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { Text } from '../../../../components/text';
import { TextSkeleton } from '../../../../components/text-skeleton';
import { isJetpackCrmLicenseKey } from '../license-status';
import { getExtensionDescription } from './extension-descriptions';

const JETPACK_CRM_APP_URL =
	config( 'env' ) === 'development'
		? 'https://devapp.jetpackcrm.com'
		: 'https://app.jetpackcrm.com';

const CONNECTION_ERROR = () =>
	__( 'Could not connect to download server. Please check your connection and try again.' );

const getExtensionsStatusMessages = (): Record< number, string > => ( {
	404: __( 'Extensions not found' ),
} );

const getDownloadStatusMessages = (): Record< number, string > => ( {
	400: __( 'Missing required fields' ),
	401: __( 'Invalid API key' ),
	403: __( 'Invalid license key format. Must be a Jetpack Complete license key.' ),
	404: __( 'Extension not found' ),
} );

function getErrorMessage( error: Error, statusMessages: Record< number, string > ) {
	const message =
		error instanceof JetpackCrmRequestError
			? error.message || statusMessages[ error.status ] || CONNECTION_ERROR()
			: CONNECTION_ERROR();
	/* translators: %s is an error message from the download server */
	return sprintf( __( 'Error: %s' ), message );
}

function LicenseKeyCard( { licenseKey }: { licenseKey: string } ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	return (
		<Card>
			<CardBody>
				<ClipboardInputControl
					label={ __( 'License key' ) }
					value={ licenseKey }
					readOnly
					help={
						<ExternalLink href="https://kb.jetpackcrm.com/knowledge-base/how-to-activate-your-license-key/">
							{ __( 'How to activate' ) }
						</ExternalLink>
					}
					onCopy={ () =>
						createSuccessNotice( __( 'License key copied to clipboard.' ), { type: 'snackbar' } )
					}
				/>
			</CardBody>
		</Card>
	);
}

function ExtensionsList( { licenseKey }: { licenseKey: string } ) {
	const { createInfoNotice, createErrorNotice } = useDispatch( noticesStore );
	const {
		data: extensions,
		error,
		isLoading,
		isError,
		refetch,
		isFetching,
	} = useQuery( jetpackCrmExtensionsQuery( JETPACK_CRM_APP_URL ) );
	const { mutate: fetchDownload } = useMutation(
		jetpackCrmExtensionDownloadMutation( JETPACK_CRM_APP_URL, licenseKey )
	);
	// Several downloads can be in flight at once, so pending state is tracked per extension.
	const [ pendingSlugs, setPendingSlugs ] = useState< string[] >( [] );

	useEffect( () => {
		if ( error ) {
			createErrorNotice( getErrorMessage( error, getExtensionsStatusMessages() ), {
				type: 'snackbar',
			} );
		}
	}, [ error, createErrorNotice ] );

	const download = ( extension: JetpackCrmExtension ) => {
		setPendingSlugs( ( slugs ) => [ ...slugs, extension.slug ] );
		fetchDownload( extension.slug, {
			onSuccess: ( { download_url } ) => {
				window.location.assign( download_url );
				createInfoNotice(
					/* translators: %s is the name of a Jetpack CRM extension */
					sprintf( __( 'Downloading %s' ), extension.name ),
					{ type: 'snackbar' }
				);
			},
			onError: ( downloadError ) =>
				createErrorNotice( getErrorMessage( downloadError, getDownloadStatusMessages() ), {
					type: 'snackbar',
				} ),
			onSettled: () =>
				setPendingSlugs( ( slugs ) => slugs.filter( ( slug ) => slug !== extension.slug ) ),
		} );
	};

	if ( isLoading ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<TextSkeleton length={ 20 } />
						<TextSkeleton length={ 40 } />
						<TextSkeleton length={ 30 } />
					</VStack>
				</CardBody>
			</Card>
		);
	}

	// As in classic, a failed request only shows the error notice; the retry is
	// for a server that answers with an empty list.
	if ( isError || ! extensions ) {
		return null;
	}

	if ( ! extensions.length ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 } alignment="left">
						<Text>{ CONNECTION_ERROR() }</Text>
						<Button
							variant="secondary"
							__next40pxDefaultSize
							isBusy={ isFetching }
							disabled={ isFetching }
							onClick={ () => refetch() }
						>
							{ __( 'Try again' ) }
						</Button>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	return (
		<ActionList title={ __( 'Extensions' ) }>
			{ extensions.map( ( extension ) => {
				const isPending = pendingSlugs.includes( extension.slug );
				return (
					<ActionList.ActionItem
						key={ extension.slug }
						title={
							<HStack spacing={ 2 } justify="flex-start">
								<span>{ extension.name }</span>
								<Text variant="muted">v{ extension.version }</Text>
							</HStack>
						}
						description={
							<VStack spacing={ 1 }>
								{ extension.kbUrl && (
									<ExternalLink href={ extension.kbUrl }>{ __( 'Documentation' ) }</ExternalLink>
								) }
								<span>{ getExtensionDescription( extension.slug, extension.description ) }</span>
							</VStack>
						}
						actions={
							<Button
								variant="secondary"
								size="compact"
								isBusy={ isPending }
								disabled={ isPending }
								onClick={ () => download( extension ) }
							>
								{ isPending ? __( 'Downloading…' ) : __( 'Download' ) }
							</Button>
						}
					/>
				);
			} ) }
		</ActionList>
	);
}

export default function CrmDownloads() {
	const { licenseKey } = marketplacePurchasesCrmDownloadsRoute.useParams();
	const isValidKey = isJetpackCrmLicenseKey( licenseKey );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'CRM downloads' ) } />
			}
		>
			{ isValidKey ? (
				<>
					<LicenseKeyCard licenseKey={ licenseKey } />
					<ExtensionsList licenseKey={ licenseKey } />
				</>
			) : (
				<EmptyState.Wrapper>
					<EmptyState>
						<EmptyState.Header>
							<EmptyState.Title>{ __( 'Invalid license key' ) }</EmptyState.Title>
							<EmptyState.Description>
								{ __(
									'This page is only available for Jetpack Complete or Jetpack CRM license keys. Please check your license key and try again.'
								) }
							</EmptyState.Description>
						</EmptyState.Header>
					</EmptyState>
				</EmptyState.Wrapper>
			) }
		</PageLayout>
	);
}
