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
import { isTargetUrlValid, isSubdomainValid, parseTargetUrl } from './utils';
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

	const redirectTypeField = {
		id: 'redirectType',
		label: __( 'HTTP Redirect Type' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Temporary redirect (307)' ),
				value: 'temporary',
				description: __( 'Enables quick propagation of changes to your forwarding address.' ),
			},
			{
				label: __( 'Permanent redirect (301)' ),
				value: 'permanent',
				description: __(
					'Enables browser caching of the forwarding address for quicker resolution. Note that changes might take longer to fully propagate.'
				),
			},
		],
	};
	const pathForwardingField = {
		id: 'pathForwarding',
		label: __( 'Path forwarding' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Do not forward' ),
				value: 'no',
			},
			{
				label: __( 'Forward path' ),
				value: 'yes',
				description: __(
					'Redirects the path after the domain name to the corresponding path at the new address.'
				),
			},
		],
	};

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'sourceType',
				label: __( 'Source URL' ),
				type: 'text' as const,
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
				type: 'text' as const,
				isValid: {
					custom: ( item ) => {
						if ( ! isSubdomainValid( item.subdomain ) ) {
							return 'Subdomain should be a valid domain label - up to 63 characters, starting with a letter or number, and containing only letters, numbers, and hyphens.';
						}
						return null;
					},
				},
				isVisible: ( item: FormData ) => {
					return item.sourceType === 'subdomain';
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
							return 'Please enter a valid URL.';
						}
						return null;
					},
				},
			},
			redirectTypeField,
			pathForwardingField,
		],
		[ domainName ]
	);

	// Split fields into basic and advanced
	const basicFieldIds = [ 'sourceType', 'subdomain', 'targetUrl' ];
	const basicFields = fields.filter( ( field ) => basicFieldIds.includes( field.id ) );

	const form = {
		type: 'regular' as const,
		fields: basicFieldIds,
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

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
												label={ redirectTypeField.label }
												selected={ formData.redirectType }
												options={ redirectTypeField.elements }
												onChange={ ( value: string ) => {
													setFormData( ( data ) => ( {
														...data,
														redirectType: value as 'temporary' | 'permanent',
													} ) );
												} }
											/>
											<RadioControl
												label={ pathForwardingField.label }
												selected={ formData.pathForwarding }
												options={ pathForwardingField.elements }
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

							<HStack justify="start" spacing={ 4 }>
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
