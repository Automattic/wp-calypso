import { DomainSubtype, FreeSiteAddressType, isWpError } from '@automattic/api-core';
import {
	validateSiteAddressChangeMutation,
	changeSiteAddressChangeMutation,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { check, closeSmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useAppContext } from '../../app/context';
import { ButtonStack } from '../../components/button-stack';
import SuffixInputControl from '../../components/input-control/suffix-input-control';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import { getAddSiteDomainUrl } from '../../utils/domain-url';
import { parseHtmlMessage } from '../../utils/html-message';
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
	validity,
}: DataFormControlProps< Item > ) => {
	const { id, getValue } = field;
	return (
		<SuffixInputControl
			customValidity={ validity?.custom }
			label={ field.label }
			value={ getValue( { item: data } ) }
			suffix={ DOMAIN_SUFFIX }
			onChange={ ( newValue: string ) => {
				onChange( { [ id ]: newValue } as Partial< Item > );
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
	const { queries } = useAppContext();
	const { createErrorNotice } = useDispatch( noticesStore );
	const { data: siteDomains } = useQuery( {
		...queries.domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
		},
	} );
	const mutation = useMutation( validateSiteAddressChangeMutation() );
	const [ formData, setFormData ] = useState( {
		subdomain: '',
	} );
	const [ addressError, setAddressError ] = useState< {
		subdomain: string;
		message: string;
	} | null >( null );
	const formRef = useRef< HTMLFormElement >( null );

	const currentAddressError =
		addressError?.subdomain === formData.subdomain ? addressError.message : null;

	const validity = currentAddressError
		? ( { subdomain: { custom: { type: 'invalid', message: currentAddressError } } } as const )
		: undefined;

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
		( domain ) =>
			domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS &&
			! domain.tags.includes( 'wpcom_staging' )
	);

	const hasCustomDomain = !! siteDomains?.find(
		( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS
	);

	const isDisabled =
		! formData.subdomain || formData.subdomain === currentSubdomain || !! currentAddressError;

	const handleSubmit = ( event: React.SubmitEvent ) => {
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
					const { text, link } = parseHtmlMessage( error.message ?? '' );

					// `invalid` errors are about the address itself, so these errors are presented
					// attached to the subdomain field.
					if ( isWpError( error ) && error.code === 'invalid' ) {
						// Commit synchronously so the input's custom validity is set before reporting it.
						// DataForm hides a field's error until it's touched, which it isn't when the form
						// is submitted with Enter.
						flushSync( () =>
							setAddressError( {
								subdomain: formData.subdomain,
								message: text || __( 'Sorry, that site address is unavailable.' ),
							} )
						);
						formRef.current?.reportValidity();
						return;
					}

					createErrorNotice( text || __( 'Failed to validate site address.' ), {
						type: 'snackbar',
						actions: link ? [ link ] : undefined,
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
								'Before changing site address, consider <link>adding a custom domain</link> instead?'
							),
							{
								link: <a href={ getAddSiteDomainUrl( site.slug ) } />,
							}
						) }
					</Text>
				</Notice>
			) }
			<Text as="p">
				{ sprintf(
					/* translators: %s: site domain */
					__( 'Once you change your site address, %s will no longer be available.' ),
					wpcomDomain?.domain ?? ''
				) }
			</Text>
			<form ref={ formRef } onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< NewSiteAddressFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						validity={ validity }
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
					const { text, link } = parseHtmlMessage( error.message ?? '' );
					createErrorNotice( text || __( 'Failed to change site address.' ), {
						type: 'snackbar',
						actions: link ? [ link ] : undefined,
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
