import { Card, Gridicon, Button } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import isJetpackCrmProduct from 'calypso/components/crm-downloads/is-jetpack-crm-product';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import useFetchJetpackCRMExtensionsQuery, {
	Extension,
} from 'calypso/data/jetpack-crm/use-fetch-jetpack-crm-extensions';
import useHandleExtensionsDownloadMutation from 'calypso/data/jetpack-crm/use-handle-extensions-download-mutation';
import { useDispatch } from 'calypso/state';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';

import './style.scss';

// Loading skeleton component for the extensions table
const LoadingSkeleton = () => (
	<div className="extensions-table__loading">
		<div className="extensions-table__loading-item" />
		<div className="extensions-table__loading-item" />
		<div className="extensions-table__loading-item" />
	</div>
);

interface CrmDownloadsProps {
	licenseKey: string;
	isLoading?: boolean;
}

// Error component for invalid license key
const InvalidLicenseError = () => {
	const translate = useTranslate();
	return (
		<div className="crm-downloads-error">
			<Gridicon icon="notice" size={ 48 } />
			<h2>{ translate( 'Invalid License Key' ) }</h2>
			<p>
				{ translate(
					'This page is only available for Jetpack Complete or Jetpack CRM license keys. ' +
						'Please check your license key and try again.'
				) }
			</p>
		</div>
	);
};

export function CrmDownloadsContent( { licenseKey, isLoading }: CrmDownloadsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ loadingExtensions, setLoadingExtensions ] = useState< string[] >( [] );
	const isValidKey = isLoading || isJetpackCrmProduct( licenseKey );
	const { mutateAsync: mutateExtensionDownload } =
		useHandleExtensionsDownloadMutation( licenseKey );
	const {
		data: extensions,
		error,
		isLoading: isLoadingExtensions,
		isError,
		refetch: refetchExtensions,
	} = useFetchJetpackCRMExtensionsQuery( isValidKey );

	if ( isError ) {
		if ( error instanceof Error ) {
			dispatch(
				errorNotice(
					translate( 'Error: %(message)s', {
						args: { message: error.message },
					} )
				)
			);
		} else {
			dispatch(
				errorNotice(
					translate(
						'Could not connect to download server. Please check your connection and try again.'
					)
				)
			);
		}
	}

	const handleExtensionDownload = useCallback(
		async ( extensionSlug: string, extension: Extension ) => {
			setLoadingExtensions( [ ...loadingExtensions, extensionSlug ] );
			// Mutate and download the extension
			mutateExtensionDownload( extensionSlug, {
				onError: ( error ) => {
					if ( error instanceof Error ) {
						dispatch(
							errorNotice(
								translate( 'Error: %(message)s', {
									args: { message: error.message },
								} )
							)
						);
					} else {
						dispatch(
							errorNotice(
								translate(
									'Could not connect to download server. Please check your connection and try again.'
								)
							)
						);
					}

					setLoadingExtensions( ( prev ) => prev.filter( ( slug ) => slug !== extensionSlug ) );
				},
				onSuccess: ( data ) => {
					// Start the download
					window.location.href = data.download_url;
					// Show a notice that the download has started
					// If extension object is provided, use its name, otherwise try to find it in the extensions array
					let extensionName = extension?.name;
					if ( ! extensionName ) {
						const foundExtension = ( extensions || [] ).find(
							( ext ) => ext.slug === extensionSlug
						);
						extensionName = foundExtension?.name || extensionSlug;
					}

					dispatch(
						infoNotice(
							translate( 'Downloading %(name)s', {
								args: { name: extensionName },
							} )
						)
					);

					setLoadingExtensions( ( prev ) => prev.filter( ( slug ) => slug !== extensionSlug ) );
				},
			} );

			// Remove the extension from the loading state
		},
		[ extensions, dispatch, translate, mutateExtensionDownload ]
	);

	return (
		<div className="crm-downloads">
			{ isLoading ? (
				<LoadingSkeleton />
			) : (
				<>
					{ ! isValidKey ? (
						<InvalidLicenseError />
					) : (
						<>
							<Card className="manage-purchase__license-clipboard-container">
								<h3 className="manage-purchase__license-key-heading">
									{ translate( 'License Key' ) }
								</h3>
								<ExternalLink
									className="manage-purchase__license-clipboard-link"
									href="https://kb.jetpackcrm.com/knowledge-base/how-to-activate-your-license-key/"
								>
									{ translate( 'How to activate' ) }
								</ExternalLink>
								<div className="manage-purchase__license-key-row">
									<div className="manage-purchase__license-clipboard">
										<code className="manage-purchase__license-clipboard-code">{ licenseKey }</code>
										<ClipboardButton
											text={ licenseKey }
											className="manage-purchase__license-clipboard-icon"
											borderless
											compact
											onCopy={ () => {
												dispatch(
													infoNotice( translate( 'License key copied to clipboard' ), {
														duration: 3000,
														showDismiss: false,
													} )
												);
											} }
										>
											<Gridicon icon="clipboard" />
										</ClipboardButton>
									</div>
								</div>
							</Card>
							<div className="extensions-table">
								{ isLoadingExtensions && <LoadingSkeleton /> }
								{ ! isLoadingExtensions && extensions && extensions.length > 0 && (
									<table>
										<tbody>
											{ ( extensions ? extensions : [] ).map( ( extension ) => (
												<tr key={ extension.slug }>
													<td>
														<div className="extensions-table__title-row">
															<strong>{ extension.name }</strong>
															<div className="extensions-table__version">
																v{ extension.version }
															</div>
														</div>
														{ extension.kbUrl && (
															<a
																href={ extension.kbUrl }
																target="_blank"
																rel="noopener noreferrer"
																className="extensions-table__learn-more"
															>
																{ translate( 'Documentation' ) }
															</a>
														) }
														{ extension.description && (
															<div className="extensions-table__description">
																{ extension.description }
															</div>
														) }
													</td>
													<td>
														<Button
															primary
															disabled={ loadingExtensions.includes( extension.slug ) }
															busy={ loadingExtensions.includes( extension.slug ) }
															onClick={ () => handleExtensionDownload( extension.slug, extension ) }
														>
															{ loadingExtensions.includes( extension.slug )
																? translate( 'Downloading…' )
																: translate( 'Download' ) }
														</Button>
													</td>
												</tr>
											) ) }
										</tbody>
									</table>
								) }
								{ ! isLoadingExtensions && extensions && extensions.length === 0 && (
									<div className="extensions-table__error">
										<Gridicon icon="notice" size={ 36 } />
										<p>
											{ translate(
												'Could not connect to download server. Please check your connection and try again.'
											) }
										</p>
										<Button onClick={ () => refetchExtensions() } disabled={ isLoadingExtensions }>
											{ isLoadingExtensions ? translate( 'Retrying…' ) : translate( 'Try Again' ) }
										</Button>
									</div>
								) }
							</div>
						</>
					) }
				</>
			) }
		</div>
	);
}

interface CrmDownloadsErrorProps {
	onReturnClick?: () => void;
}

export function CrmDownloadsError( { onReturnClick }: CrmDownloadsErrorProps ) {
	const translate = useTranslate();

	return (
		<div className="crm-downloads-error">
			<Gridicon icon="notice-outline" size={ 48 } />
			<h2>{ translate( 'Unable to fetch license key' ) }</h2>
			<p>
				{ translate(
					'We were unable to fetch the license key for this purchase. ' +
						'Please try again later or contact support.'
				) }
			</p>
			<Button href="/me/purchases" primary onClick={ onReturnClick }>
				{ translate( 'Return to Purchases' ) }
			</Button>
		</div>
	);
}
