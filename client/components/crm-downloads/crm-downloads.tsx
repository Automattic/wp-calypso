import { Card, Gridicon, Button } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { isJetpackCrmProduct } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { useDispatch } from 'calypso/state';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';
import { getExtensionDescription } from './extension-descriptions';

import './style.scss';

interface Extension {
	name: string;
	description: string;
	slug: string;
	version: string;
	kbUrl?: string;
}

// Loading skeleton component for the extensions table
const LoadingSkeleton = () => (
	<div className="extensions-table__loading">
		<div className="extensions-table__loading-item" />
		<div className="extensions-table__loading-item" />
		<div className="extensions-table__loading-item" />
	</div>
);

const BASE_CRM_APP_URL = 'https://devapp.jetpackcrm.com';

const fetchExtensions = async (): Promise< Extension[] > => {
	const response = await fetch( `${ BASE_CRM_APP_URL }/api/extensions`, {
		method: 'GET',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json',
		},
	} );

	if ( ! response.ok ) {
		switch ( response.status ) {
			case 404:
				throw new Error( 'Extensions not found' );
			default:
				throw new Error(
					'Could not connect to download server. Please check your connection and try again.'
				);
		}
	}

	const data = await response.json();
	if ( ! data.success || ! Array.isArray( data.extensions ) ) {
		throw new Error(
			data.message ||
				'Could not connect to download server. Please check your connection and try again.'
		);
	}

	// Apply translatable descriptions to the extensions
	const extensionsWithTranslatedDescriptions = data.extensions.map( ( extension: Extension ) => ( {
		...extension,
		// Use the translatable description if available, otherwise use the original
		description: getExtensionDescription( extension.slug ) || extension.description,
	} ) );

	// Sort extensions alphabetically
	return extensionsWithTranslatedDescriptions.sort( ( a: Extension, b: Extension ) =>
		a.name.localeCompare( b.name )
	);
};

interface CrmDownloadsProps {
	licenseKey: string;
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

export function CrmDownloadsContent( { licenseKey }: CrmDownloadsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ loadingExtensions, setLoadingExtensions ] = useState< string[] >( [] );
	const [ isLoadingExtensions, setIsLoadingExtensions ] = useState( true );
	const [ extensions, setExtensions ] = useState< Extension[] >( [] );
	const [ isValidKey, setIsValidKey ] = useState< boolean >( isJetpackCrmProduct( licenseKey ) );

	// Function to load extensions
	const loadExtensions = async () => {
		// Skip loading if license key is invalid
		if ( ! isValidKey ) {
			setIsLoadingExtensions( false );
			return;
		}

		setIsLoadingExtensions( true );
		try {
			const fetchedExtensions = await fetchExtensions();
			setExtensions( fetchedExtensions );
		} catch ( error ) {
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
		} finally {
			setIsLoadingExtensions( false );
		}
	};

	// Check license key validity and load extensions on component mount or when license key changes
	useEffect( () => {
		const valid = isJetpackCrmProduct( licenseKey );
		setIsValidKey( valid );

		if ( valid ) {
			loadExtensions();
		} else {
			setIsLoadingExtensions( false );
		}
	}, [ licenseKey ] );

	// Function to handle extension download
	const handleDownload = async ( extensionSlug: string, extension?: Extension ) => {
		// Add the extension to the loading state
		setLoadingExtensions( ( prev ) => [ ...prev, extensionSlug ] );

		try {
			const requestData = {
				license_key: licenseKey,
				extension_slug: extensionSlug,
			};

			// API URL for downloads
			const apiUrl = `${ BASE_CRM_APP_URL }/api/downloads/jetpack-complete`;

			const response = await fetch( apiUrl, {
				method: 'POST',
				credentials: 'omit',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( requestData ),
			} );

			if ( ! response.ok ) {
				// Handle error based on status code
				switch ( response.status ) {
					case 400:
						throw new Error( 'Missing required fields' );
					case 401:
						throw new Error( 'Invalid API key' );
					case 403:
						throw new Error(
							'Invalid license key format. Must be a Jetpack Complete license key.'
						);
					case 404:
						throw new Error( 'Extension not found' );
					default:
						throw new Error(
							'Could not connect to download server. Please check your connection and try again.'
						);
				}
			}

			const data = await response.json();
			if ( ! data.success ) {
				// Use a default message if none is provided
				if ( data.message ) {
					dispatch(
						errorNotice(
							translate( 'Failed to download extension: %(message)s', {
								args: { message: data.message },
							} )
						)
					);
				} else {
					dispatch( errorNotice( translate( 'Failed to download extension' ) ) );
				}
				return;
			}

			// Start the download
			window.location.href = data.download_url;

			// Show a notice that the download has started
			// If extension object is provided, use its name, otherwise try to find it in the extensions array
			let extensionName = extension?.name;
			if ( ! extensionName ) {
				const foundExtension = extensions.find( ( ext ) => ext.slug === extensionSlug );
				extensionName = foundExtension?.name || extensionSlug;
			}

			dispatch(
				infoNotice(
					translate( 'Downloading %(name)s', {
						args: { name: extensionName },
					} )
				)
			);
		} catch ( error ) {
			// Show error message to the user
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
		} finally {
			// Remove the extension from the loading state
			setLoadingExtensions( ( prev ) => prev.filter( ( slug ) => slug !== extensionSlug ) );
		}
	};

	return (
		<div className="crm-downloads">
			{ ! isValidKey ? (
				<InvalidLicenseError />
			) : (
				<>
					<Card className="manage-purchase__license-clipboard-container">
						<h3 className="manage-purchase__license-key-heading">{ translate( 'License Key' ) }</h3>
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
						{ ! isLoadingExtensions && extensions.length > 0 && (
							<table>
								<tbody>
									{ extensions.map( ( extension ) => (
										<tr key={ extension.slug }>
											<td>
												<div className="extensions-table__title-row">
													<strong>{ extension.name }</strong>
													<div className="extensions-table__version">v{ extension.version }</div>
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
													disabled={
														loadingExtensions.includes( extension.slug ) || isLoadingExtensions
													}
													busy={ loadingExtensions.includes( extension.slug ) }
													onClick={ () => handleDownload( extension.slug, extension ) }
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
						{ ! isLoadingExtensions && extensions.length === 0 && (
							<div className="extensions-table__error">
								<Gridicon icon="notice" size={ 36 } />
								<p>
									{ translate(
										'Could not connect to download server. Please check your connection and try again.'
									) }
								</p>
								<Button onClick={ () => loadExtensions() } disabled={ isLoadingExtensions }>
									{ isLoadingExtensions ? translate( 'Retrying…' ) : translate( 'Try Again' ) }
								</Button>
							</div>
						) }
					</div>
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
