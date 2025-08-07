import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import {
	domainForwardingQuery,
	domainForwardingSaveMutation,
} from '../../app/queries/domain-forwarding';
import { domainRoute, domainForwardingsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
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
		return forwardingData.find( ( f ) => f.domain_redirect_id === parseInt( forwardingId ) );
	}, [ isEdit, forwardingData, forwardingId ] );

	const [ formData, setFormData ] = useState< FormData >( () => {
		if ( existingForwarding ) {
			const protocol = existingForwarding.is_secure ? 'https://' : 'http://';
			const targetUrl = `${ protocol }${ existingForwarding.target_host }${
				existingForwarding.target_path || ''
			}`;

			return {
				sourceType: existingForwarding.subdomain ? 'subdomain' : 'root',
				subdomain: existingForwarding.subdomain || '',
				targetUrl,
				redirectType: existingForwarding.is_permanent ? 'permanent' : 'temporary',
				pathForwarding: existingForwarding.forward_paths ? 'yes' : 'no',
			};
		}

		return {
			sourceType: 'subdomain',
			subdomain: '',
			targetUrl: '',
			redirectType: 'temporary',
			pathForwarding: 'no',
		};
	} );

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
			},
			{
				id: 'targetUrl',
				label: __( 'Target URL' ),
				help: __( 'The URL to redirect to (e.g., https://example.com/path)' ),
				type: 'text',
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

	const form = {
		type: 'regular',
		fields:
			formData.sourceType === 'subdomain'
				? [ 'sourceType', 'subdomain', 'targetUrl', 'redirectType', 'pathForwarding' ]
				: [ 'sourceType', 'targetUrl', 'redirectType', 'pathForwarding' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! formData.targetUrl.trim() ) {
			createErrorNotice( __( 'Target URL is required.' ), { type: 'snackbar' } );
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
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< FormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>

							<HStack justify="space-between">
								<Link to={ domainForwardingsRoute.fullPath } params={ { domainName } }>
									<Button variant="tertiary">{ __( 'Cancel' ) }</Button>
								</Link>

								<Button variant="primary" type="submit" isBusy={ isPending } disabled={ isPending }>
									{ isEdit ? __( 'Update' ) : __( 'Add' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
