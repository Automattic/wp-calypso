import { FreeSiteAddressType } from '@automattic/api-core';
import {
	validateSiteAddressChangeMutation,
	changeSiteAddressChangeMutation,
	siteDomainsQuery,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, ExternalLink, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { check, closeSmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import SuffixInputControl from '../../components/input-control/suffix-input-control';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import type { Site, DomainSummary } from '@automattic/api-core';
import type { DataFormControlProps, Field } from '@wordpress/dataviews';

type NewSiteAddressFormData = {
	subdomain: string;
};

type ConfirmNewSiteAddressFormData = {
	accept_undone: boolean;
};

const MIN_STEP = 0;

const MAX_STEP = 1;

const DOMAIN_SUFFIX = '.wordpress.com';

const SubdomainInputControlEdit = < Item, >( {
	field,
	data,
	onChange,
}: DataFormControlProps< Item > ) => {
	const { id, getValue } = field;
	return (
		<SuffixInputControl
			label={ field.label }
			value={ getValue( { item: data } ) }
			__next40pxDefaultSize
			suffix={ <Text variant="muted">{ DOMAIN_SUFFIX }</Text> }
			onChange={ ( newValue ) => {
				onChange( { [ id ]: newValue } );
			} }
		/>
	);
};

const NewSiteAddressForm = ( {
	site,
	currentSubdomain,
	onSubmit,
	onCancel,
}: {
	site: Site;
	currentSubdomain: string;
	onSubmit: ( data: NewSiteAddressFormData ) => void;
	onCancel: () => void;
} ) => {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { data: siteDomains } = useQuery( siteDomainsQuery( site.ID ) );
	const mutation = useMutation( validateSiteAddressChangeMutation() );
	const [ formData, setFormData ] = useState( {
		subdomain: '',
	} );

	const fields: Field< NewSiteAddressFormData >[] = [
		{
			id: 'subdomain',
			label: __( 'New site address' ),
			type: 'text' as const,
			placeholder: currentSubdomain,
			Edit: SubdomainInputControlEdit,
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'subdomain' ],
	};

	const wpcomDomain = siteDomains?.find(
		( domain ) => domain.wpcom_domain && ! domain.is_wpcom_staging_domain
	);

	const hasCustomDomain = !! siteDomains?.find( ( domain ) => ! domain.wpcom_domain );

	const isDisabled = ! formData.subdomain || formData.subdomain === currentSubdomain;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		mutation.mutate(
			{
				siteId: site.ID,
				blogname: formData.subdomain,
				domainSuffix: DOMAIN_SUFFIX.substring( 1 ),
				siteAddressType: FreeSiteAddressType.BLOG,
			},
			{
				onSuccess: () => {
					onSubmit( formData );
				},
				onError: ( error ) => {
					// TODO: Show the error via Data Form when the ValidatedInputControl is ready.
					createErrorNotice( error.message ?? __( 'Sorry, that site address is unavailable.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	return (
		<VStack spacing={ 4 }>
			{ !! siteDomains && ! hasCustomDomain && (
				<Notice variant="warning" density="medium">
					<Text>
						{ createInterpolateElement(
							__(
								'Before changing site address, consider <link>add a custom domain</link> instead?'
							),
							{
								link: <ExternalLink href={ `/domains/add/${ site.slug }` } children={ null } />,
							}
						) }
					</Text>
				</Notice>
			) }
			<Text as="p">
				{ sprintf(
					/* translators: %s: site domain */
					__( 'Once you change your site address, %s will no longer be available.' ),
					wpcomDomain?.domain
				) }
			</Text>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< NewSiteAddressFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< NewSiteAddressFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" disabled={ mutation.isPending } onClick={ onCancel }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ isDisabled }
						>
							{ __( 'Next' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</VStack>
	);
};

const ConfirmNewSiteAddressForm = ( {
	site,
	currentDomain,
	currentSubdomain,
	newSubdomain,
	onSubmit,
	onBack,
}: {
	site: Site;
	currentDomain: string;
	currentSubdomain: string;
	newSubdomain: string;
	onSubmit: () => void;
	onBack: () => void;
} ) => {
	const router = useRouter();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( changeSiteAddressChangeMutation() );

	const newSiteAddress = `${ newSubdomain }${ DOMAIN_SUFFIX }`;

	const [ formData, setFormData ] = useState( {
		accept_undone: false,
	} );

	const fields: Field< ConfirmNewSiteAddressFormData >[] = [
		{
			id: 'accept_undone',
			label: __( 'I understand that I won’t be able to undo this change.' ),
			type: 'boolean' as const,
			Edit: 'checkbox',
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'accept_undone' ],
	};

	const isDisabled = Object.values( formData ).some( ( value ) => ! value );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		mutation.mutate(
			{
				siteId: site.ID,
				blogname: newSubdomain,
				domainSuffix: DOMAIN_SUFFIX.substring( 1 ),
				siteAddressType: FreeSiteAddressType.BLOG,
				oldDomain: currentDomain,
				discard: true,
				requireVerifiedEmail: true,
			},
			{
				onSuccess: () => {
					router.navigate( {
						to: window.location.href
							.replace( window.location.origin, '' )
							.replace( site.slug, newSiteAddress ),
					} );

					onSubmit();

					createSuccessNotice(
						sprintf(
							/* translators: %s: site name */
							__( 'The site address has been changed to %s successfully.' ),
							newSiteAddress
						),
						{ type: 'snackbar' }
					);
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message || __( 'Failed to change site address' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	return (
		<VStack spacing={ 4 }>
			<Text as="p">{ __( 'Once you confirm, this will be the new address for your site:' ) }</Text>
			<Text as="p" intent="success" style={ { display: 'flex', alignItems: 'center ' } }>
				<Icon icon={ check } size={ 24 } style={ { fill: 'currentColor' } } />
				<strong>{ newSubdomain }</strong>
				{ DOMAIN_SUFFIX }
			</Text>
			<Text as="p">{ __( 'And this address will be removed and unavailable for use:' ) }</Text>
			<Text as="p" intent="error" style={ { display: 'flex', alignItems: 'center ' } }>
				<Icon icon={ closeSmall } size={ 24 } style={ { fill: 'currentColor' } } />
				<strong>{ currentSubdomain }</strong>
				{ DOMAIN_SUFFIX }
			</Text>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< ConfirmNewSiteAddressFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< ConfirmNewSiteAddressFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" disabled={ mutation.isPending } onClick={ onBack }>
							{ __( 'Back' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ mutation.isPending }
							disabled={ isDisabled }
						>
							{ __( 'Confirm' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</VStack>
	);
};

const SiteChangeAddressContent = ( {
	site,
	domain,
	onClose,
}: {
	site: Site;
	domain: DomainSummary;
	onClose: () => void;
} ) => {
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ subdomain, setSubdomain ] = useState( '' );
	const currentSubdomain = domain.domain.replace( DOMAIN_SUFFIX, '' );

	const handleBack = () => setCurrentStep( ( step ) => Math.max( step - 1, MIN_STEP ) );

	const handleForward = () => setCurrentStep( ( step ) => Math.min( step + 1, MAX_STEP ) );

	const handleNewAddressChange = ( data: NewSiteAddressFormData ) => {
		setSubdomain( data.subdomain );
		handleForward();
	};

	return (
		<>
			{ currentStep === 0 && (
				<NewSiteAddressForm
					site={ site }
					currentSubdomain={ currentSubdomain }
					onSubmit={ handleNewAddressChange }
					onCancel={ onClose }
				/>
			) }
			{ currentStep === 1 && (
				<ConfirmNewSiteAddressForm
					site={ site }
					currentDomain={ domain.domain }
					currentSubdomain={ currentSubdomain }
					newSubdomain={ subdomain }
					onSubmit={ onClose }
					onBack={ handleBack }
				/>
			) }
		</>
	);
};

export default SiteChangeAddressContent;
