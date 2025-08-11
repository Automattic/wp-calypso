import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Panel,
	PanelBody,
	PanelRow,
	RadioControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { useState, useMemo, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	domainForwardingQuery,
	domainForwardingSaveMutation,
} from '../../app/queries/domain-forwarding';
import { domainRoute, domainForwardingsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import type { DomainForwardingFormData } from '../../data/domain-forwarding';
import type { Field } from '@wordpress/dataviews';

interface DomainForwardingFormProps {
	isEdit?: boolean;
}

interface FormData {
	sourceType: 'root' | 'subdomain';
	subdomain: string;
	targetUrl: string;
	redirectType: 'temporary' | 'permanent';
	pathForwarding: 'no' | 'yes';
}

// Validation helpers (copied to keep this UI self-contained)
const SOFT_URL_REGEX =
	/^(https?:)?(?:[a-zA-Z0-9-.]+\.)?[a-zA-Z]{0,}(?:\/[^\s]*){0,}(:[0-9/a-z-#]*)?$/i;
const SUBDOMAIN_LABEL_REGEX = /^(?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/i;

function normalizeUrlWithDefaultProtocol( input: string ): string {
	if ( ! input ) {
		return '';
	}
	return /^https?:\/\//i.test( input ) ? input : `https://${ input }`;
}

function getDomainPartsAndLevel( domain: string ): [ string[], number ] {
	const parts = domain.split( '.' );
	return [ parts, parts.length ];
}

function isSameDomain(
	domainParts: string[],
	targetHostParts: string[],
	domainLevel: number
): boolean {
	for ( let i = 0; i < domainLevel; i++ ) {
		if ( domainParts[ i ] !== targetHostParts[ i ] ) {
			return false;
		}
	}
	return true;
}

function isSubdomain(
	domainParts: string[],
	targetHostParts: string[],
	domainLevel: number,
	targetHostLevel: number
): boolean {
	for ( let i = 1; i <= Math.min( domainLevel, targetHostLevel ); i++ ) {
		if ( domainParts[ domainLevel - i ] !== targetHostParts[ targetHostLevel - i ] ) {
			return false;
		}
	}
	return true;
}

function isTargetUrlValid( value: string, fullDomain: string ): boolean {
	const input = value?.trim() || '';
	if ( ! input ) {
		return false;
	}
	const normalized = normalizeUrlWithDefaultProtocol( input );
	if ( ! SOFT_URL_REGEX.test( normalized ) ) {
		return false;
	}
	try {
		const url = new URL( normalized );
		const [ domainParts, domainLevel ] = getDomainPartsAndLevel( fullDomain );
		const [ targetHostParts, targetHostLevel ] = getDomainPartsAndLevel( url.hostname );

		if ( domainLevel > targetHostLevel ) {
			return true;
		}
		if ( domainLevel === targetHostLevel ) {
			if ( isSameDomain( domainParts, targetHostParts, domainLevel ) ) {
				const targetPath = url.pathname + url.search + url.hash;
				if ( ! targetPath || /^\/+$/.test( targetPath ) ) {
					return false; // same domain root disallowed
				}
			}
			return true;
		}
		if ( isSubdomain( domainParts, targetHostParts, domainLevel, targetHostLevel ) ) {
			return false; // further nested subdomain disallowed
		}
		return true;
	} catch {
		return false;
	}
}

function isSubdomainValid( value: string ): boolean {
	if ( ! value ) {
		return true; // treat empty as valid; field presence is controlled by form config
	}
	return SUBDOMAIN_LABEL_REGEX.test( value );
}

function parseTargetUrl( targetUrl: string ) {
	try {
		// Add protocol if missing
		const urlWithProtocol = targetUrl.match( /^https?:\/\// ) ? targetUrl : `http://${ targetUrl }`;
		const url = new URL( urlWithProtocol );

		return {
			target_host: url.hostname,
			target_path: url.pathname + url.search + url.hash,
			is_secure: url.protocol === 'https:',
		};
	} catch {
		// Fallback for invalid URLs - treat as hostname only
		return {
			target_host: targetUrl.replace( /^https?:\/\//, '' ).split( '/' )[ 0 ],
			target_path: '',
			is_secure: targetUrl.startsWith( 'https://' ),
		};
	}
}

export default function DomainForwardingForm( { isEdit = false }: DomainForwardingFormProps ) {
	const router = useRouter();
	const { domainName, forwardingId } = domainRoute.useParams();
	const { data: forwardingData } = useQuery( domainForwardingQuery( domainName ) );
	const saveMutation = useMutation( domainForwardingSaveMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Find existing forwarding if editing
	const existingForwarding = useMemo( () => {
		if ( ! isEdit || ! forwardingData || ! forwardingId ) {
			return null;
		}
		return forwardingData.find( ( f ) => f.domain_redirect_id === parseInt( forwardingId, 10 ) );
	}, [ isEdit, forwardingData, forwardingId ] );

	const [ formData, setFormData ] = useState< FormData >( {
		sourceType: 'subdomain',
		subdomain: '',
		targetUrl: '',
		redirectType: 'temporary',
		pathForwarding: 'no',
	} );

	useEffect( () => {
		if ( ! isEdit || ! existingForwarding ) {
			return;
		}
		const protocol = existingForwarding.is_secure ? 'https://' : 'http://';
		setFormData( {
			sourceType: existingForwarding.subdomain ? 'subdomain' : 'root',
			subdomain: existingForwarding.subdomain || '',
			targetUrl: `${ protocol }${ existingForwarding.target_host }${
				existingForwarding.target_path || ''
			}`,
			redirectType: existingForwarding.is_permanent ? 'permanent' : 'temporary',
			pathForwarding: existingForwarding.forward_paths ? 'yes' : 'no',
		} );
	}, [ isEdit, existingForwarding ] );

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'sourceType',
				label: __( 'Source URL' ),
				type: 'text',
				Edit: 'select',
				elements: [
					{
						label: `${ domainName } subdomain`,
						value: 'subdomain',
					},
					{
						label: `${ domainName } root domain`,
						value: 'root',
					},
				],
			},
			{
				id: 'subdomain',
				label: __( 'Subdomain' ),
				help: __( 'Enter the subdomain (e.g., "blog")' ),
				type: 'text',
				isValid: {
					custom: ( item ) => {
						if ( ! isSubdomainValid( item.subdomain ) ) {
							return 'Error subdomain is not valid';
						}
						return null;
					},
				},
			},
			{
				id: 'targetUrl',
				label: __( 'Target URL' ),
				help: __( 'The URL to redirect to (e.g., https://example.com/path)' ),
				type: 'text',
				isValid: {
					custom: ( item ) => {
						if ( ! isTargetUrlValid( item.targetUrl, domainName ) ) {
							return 'Error target URL is not valid';
						}
						return null;
					},
				},
			},
			{
				id: 'redirectType',
				label: __( 'HTTP Redirect Type' ),
				type: 'text',
				Edit: 'radio',
				elements: [
					{
						label: __( 'Temporary redirect (307)' ),
						value: 'temporary',
					},
					{
						label: __( 'Permanent redirect (301)' ),
						value: 'permanent',
					},
				],
			},
			{
				id: 'pathForwarding',
				label: __( 'Path forwarding' ),
				type: 'text',
				Edit: 'radio',
				elements: [
					{
						label: __( 'Do not forward' ),
						value: 'no',
					},
					{
						label: __( 'Forward path' ),
						value: 'yes',
					},
				],
			},
		],
		[ domainName ]
	);

	// Split fields into basic and advanced
	const basicFieldIds =
		formData.sourceType === 'subdomain'
			? [ 'sourceType', 'subdomain', 'targetUrl' ]
			: [ 'sourceType', 'targetUrl' ];

	const basicFields = fields.filter( ( field ) => basicFieldIds.includes( field.id ) );

	const form = {
		type: 'regular' as const,
		fields: basicFieldIds,
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		// Guard via same checks used by DataForm isValid
		const urlOk = isTargetUrlValid( formData.targetUrl, domainName );
		const subdomainOk =
			formData.sourceType !== 'subdomain' || isSubdomainValid( formData.subdomain );
		if ( ! urlOk || ! subdomainOk ) {
			createErrorNotice( __( 'Please fix the errors in the form.' ), { type: 'snackbar' } );
			return;
		}

		const { target_host, target_path, is_secure } = parseTargetUrl( formData.targetUrl );

		const submitData: DomainForwardingFormData = {
			subdomain:
				formData.sourceType === 'subdomain' ? formData.subdomain.trim() || undefined : undefined,
			target_host,
			target_path,
			is_secure,
			is_permanent: formData.redirectType === 'permanent',
			forward_paths: formData.pathForwarding === 'yes',
		};

		// Add ID if editing
		if ( isEdit && existingForwarding ) {
			submitData.domain_redirect_id = existingForwarding.domain_redirect_id;
		}

		saveMutation.mutate( submitData, {
			onSuccess: () => {
				createSuccessNotice(
					isEdit
						? __( 'Domain forwarding rule updated successfully.' )
						: __( 'Domain forwarding rule created successfully.' ),
					{ type: 'snackbar' }
				);
				router.navigate( {
					to: domainForwardingsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: () => {
				createErrorNotice(
					isEdit
						? __( 'Failed to update domain forwarding rule.' )
						: __( 'Failed to create domain forwarding rule.' ),
					{ type: 'snackbar' }
				);
			},
		} );
	};

	const { isPending } = saveMutation;

	/*
	const renderNoticeForPrimaryDomain = () => {
		if ( ! domain?.isPrimary || domain?.is_domain_only_site ) {
			return;
		}

		const noticeText = __(
			"This domain is your site's main address. You can forward subdomains or {{a}}set a new primary site address{{/a}} to forward the root domain."
			{
				components: {
					a: <a href={ `/domains/manage/${ domain.domain }` } />,
				},
			}
		);

		return (
			<div className="domain-forwarding-card-notice">
				<Icon
					icon={ info }
					size={ 18 }
					className="domain-forwarding-card-notice__icon gridicon"
					viewBox="2 2 20 20"
				/>
				<div className="domain-forwarding-card-notice__message">{ noticeText }</div>
			</div>
		);
	};
	*/

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ isEdit ? __( 'Edit Domain Forwarding' ) : __( 'Add Domain Forwarding' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< FormData >
								data={ formData }
								fields={ basicFields }
								form={ form }
								onChange={ ( edits: Partial< FormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>

							<Panel>
								<PanelBody title={ __( 'Advanced settings' ) } initialOpen={ false }>
									<PanelRow>
										<VStack style={ { width: '100%' } } spacing={ 6 }>
											<RadioControl
												label={ __( 'HTTP Redirect Type' ) }
												selected={ formData.redirectType }
												options={ [
													{
														label: __( 'Temporary redirect (307)' ),
														value: 'temporary',
													},
													{
														label: __( 'Permanent redirect (301)' ),
														value: 'permanent',
													},
												] }
												onChange={ ( value: string ) => {
													setFormData( ( data ) => ( {
														...data,
														redirectType: value as 'temporary' | 'permanent',
													} ) );
												} }
											/>
											<RadioControl
												label={ __( 'Path forwarding' ) }
												selected={ formData.pathForwarding }
												options={ [
													{
														label: __( 'Do not forward' ),
														value: 'no',
													},
													{
														label: __( 'Forward path' ),
														value: 'yes',
													},
												] }
												onChange={ ( value: string ) => {
													setFormData( ( data ) => ( {
														...data,
														pathForwarding: value as 'no' | 'yes',
													} ) );
												} }
											/>
										</VStack>
									</PanelRow>
								</PanelBody>
							</Panel>

							<HStack justify="space-between">
								<Button variant="primary" type="submit" isBusy={ isPending } disabled={ isPending }>
									{ isEdit ? __( 'Update' ) : __( 'Add' ) }
								</Button>
								<RouterLinkButton
									to={ domainForwardingsRoute.fullPath }
									params={ { domainName } }
									variant="tertiary"
								>
									{ __( 'Cancel' ) }
								</RouterLinkButton>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
