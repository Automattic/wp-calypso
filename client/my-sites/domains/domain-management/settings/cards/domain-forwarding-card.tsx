import { Badge, Button, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import { localizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import { DNS_RECORDS_DEFAULT } from '@automattic/urls';
import { hasTranslation } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CAPTURE_URL_RGX_SOFT } from 'calypso/blocks/import/util';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import Accordion from 'calypso/components/domains/accordion';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import useDeleteDomainForwardingMutation from 'calypso/data/domains/forwarding/use-delete-domain-forwarding-mutation';
import useDomainForwardingQuery, {
	DomainForwardingObject,
} from 'calypso/data/domains/forwarding/use-domain-forwarding-query';
import useUpdateDomainForwardingMutation from 'calypso/data/domains/forwarding/use-update-domain-forwarding-mutation';
import { withoutHttp } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { validateDomainForwarding } from './utils/domain-forwarding';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `domain-forwarding-notification`,
};

export default function DomainForwardingCard( {
	domain,
	areAllWpcomNameServers,
}: {
	domain: ResponseDomain;
	areAllWpcomNameServers: boolean;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const { data, isLoading, isError } = useDomainForwardingQuery( domain.name );

	// const forwarding = data ? data[ 0 ] : null;
	const forwarding = null;

	// Manage local state for target url and protocol as we split forwarding target into host, path and protocol when we store it
	const [ subdomain, setSubdomain ] = useState( '' );
	const [ editingId, setEditingId ] = useState( 0 );
	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ sourceType, setSourceType ] = useState( 'domain' );
	const [ isValidUrl, setIsValidUrl ] = useState( true );
	const [ forwardPaths, setForwardPaths ] = useState( false );
	const [ isPermanent, setIsPermanent ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ protocol, setProtocol ] = useState( 'https' );
	const [ forceReloadDns, setForceReloadDns ] = useState( false );
	const pointsToWpcom = domain.pointsToWpcom;
	const isDomainOnly = useSelector( ( state ) => isDomainOnlySite( state, domain.blogId ) );

	const isPrimaryDomain = domain?.isPrimary && ! isDomainOnly;

	// Display success notices when the forwarding is updated
	const { updateDomainForwarding } = useUpdateDomainForwardingMutation( domain.name, {
		onSuccess() {
			dispatch(
				successNotice( translate( 'Domain forward updated and enabled.' ), noticeOptions )
			);
			// TODO: open the edition of the new forwarding we just created
			setEditingId( 0 );
			setForceReloadDns( true );
		},
		onError( error ) {
			dispatch( errorNotice( error.message, noticeOptions ) );
		},
	} );

	// Display success notices when the forwarding is deleted
	const { deleteDomainForwarding } = useDeleteDomainForwardingMutation( domain.name, {
		onSuccess() {
			setTargetUrl( '' );
			dispatch(
				successNotice( translate( 'Domain forward deleted successfully.' ), noticeOptions )
			);
			setForceReloadDns( true );
		},
		onError() {
			dispatch(
				errorNotice(
					translate( 'An error occurred while deleting the domain forward.' ),
					noticeOptions
				)
			);
		},
	} );

	// Render an error if the forwarding fails to load
	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while fetching your domain forwarding.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	const handleEdit = ( child: DomainForwardingObject ) => {
		setEditingId( child.domain_redirect_id );

		const origin =
			( child.is_secure ? 'http://' : 'https://' ) + ( child.target_host ?? '_invalid_.domain' );
		const url = new URL( child.target_path, origin );
		if ( url.hostname !== '_invalid_.domain' ) {
			setTargetUrl(
				( child.is_secure ? '' : 'http://' ) + url.hostname + url.pathname + url.search + url.hash
			);
			setIsPermanent( child.is_permanent );
			setForwardPaths( child.forward_paths );
			setSubdomain( child.subdomain );
			setSourceType( child.subdomain !== '' ? 'subdomain' : 'domain' );
		}
	};

	const checkIfIsThereMainDomainForwarding = () => {
		return data?.find( ( item ) => item.subdomain === '' );
	};

	useEffect( () => {
		if ( isLoading || ! data ) {
			return;
		}

		setForceReloadDns( false );
		// By default, the interface already opens with domain forwarding addition
		if ( data?.length === 0 ) {
			setEditingId( -1 );
			setSourceType( isPrimaryDomain || ! pointsToWpcom ? 'subdomain' : 'domain' );
		}
	}, [ isLoading, data ] );

	const handleAddForward = () => {
		setEditingId( -1 );

		setTargetUrl( '' );
		setIsPermanent( false );
		setForwardPaths( false );
		setSubdomain( '' );
		setSourceType( 'subdomain' );
	};

	const handleForwardToChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const inputUrl = event.target.value;
		const hasProtocol = inputUrl.startsWith( 'http://' ) || inputUrl.startsWith( 'https://' );
		setProtocol( hasProtocol ? inputUrl.split( '://' )[ 0 ] : 'https' );
		setTargetUrl( inputUrl );
	};

	const forwardValidation = () => {
		let inputUrl = targetUrl;

		const hasProtocol = inputUrl.startsWith( 'http://' ) || inputUrl.startsWith( 'https://' );
		if ( ! hasProtocol ) {
			inputUrl = protocol + '://' + inputUrl;
		}

		if ( inputUrl.length > 0 && ! CAPTURE_URL_RGX_SOFT.test( inputUrl ) ) {
			setIsValidUrl( false );
			setErrorMessage( translate( 'Please enter a valid URL.' ) );
			return;
		}

		try {
			const url = new URL( protocol + '://' + inputUrl );

			const validateDomain = validateDomainForwarding(
				domain.name,
				url.hostname,
				url.pathname + url.search + url.hash
			);
			if ( ! validateDomain.isValid ) {
				setErrorMessage( validateDomain.errorMsg );
				setIsValidUrl( false );
				return;
			}
		} catch ( e ) {
			setErrorMessage( translate( 'Please enter a valid URL.' ) );
			setIsValidUrl( false );
			return;
		}

		setIsValidUrl( true );
	};

	const handleSubdomainChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const subdomain = event.target.value;
		setSubdomain( withoutHttp( subdomain ) );

		const CAPTURE_SUBDOMAIN_RGX = /^(?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/i;

		if ( subdomain.length > 0 && ! CAPTURE_SUBDOMAIN_RGX.test( subdomain ) ) {
			setIsValidUrl( false );
			setErrorMessage( translate( 'Please enter a valid subdomain name.' ) );
			return;
		}

		setIsValidUrl( true );
	};

	const handleDelete = () => {
		setTargetUrl( '' );
		setSubdomain( '' );
		setIsValidUrl( true );

		if ( isLoading || editingId === 0 ) {
			return;
		}
		deleteDomainForwarding( editingId );
	};

	const handleDomainSubdomainChange = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		setSourceType( event.currentTarget.value );
	};

	const cleanForwardingInput = () => {
		setTargetUrl( '' );
		setIsValidUrl( true );
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		let targetHost = '';
		let targetPath = '';
		let isSecure = true;

		if ( targetUrl === '' ) {
			handleDelete();
			return false;
		}

		let target = targetUrl;
		const hasProtocol = target.startsWith( 'http://' ) || target.startsWith( 'https://' );
		if ( ! hasProtocol ) {
			target = protocol + '://' + targetUrl;
		}

		// Validate we have a valid url from the user
		try {
			const url = new URL( target, 'https://_domain_.invalid' );
			if ( url.origin !== 'https://_domain_.invalid' ) {
				targetHost = url.hostname;
				targetPath = url.pathname + url.search + url.hash;
				isSecure = url.protocol === 'https:';
			}
		} catch ( e ) {
			// ignore
		}

		updateDomainForwarding( {
			domain: domain.name,
			domain_redirect_id: editingId,
			subdomain,
			target_host: targetHost,
			target_path: targetPath,
			is_secure: isSecure,
			forward_paths: forwardPaths,
			is_permanent: isPermanent,
		} );

		return false;
	};

	const renderNotice = () => {
		// We don't want to show the notice if we are already showing the notice for the nameservers
		if ( ! areAllWpcomNameServers || pointsToWpcom ) {
			return null;
		}

		const noticeText = translate(
			'You can only forward subdomains. To forward a domain please "restore default A records." {{a}}Learn more{{/a}}.',
			{
				components: {
					a: <a href={ localizeUrl( DNS_RECORDS_DEFAULT ) } />,
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

	const renderNoticeForPrimaryDomain = () => {
		if ( ! domain?.isPrimary || isDomainOnly ) {
			return;
		}

		const newNoticeText =
			"This domain is your site's main address. You can forward subdomains or {{a}}set a new primary site address{{/a}} to forward the root domain.";

		let noticeText;
		if ( hasTranslation( newNoticeText ) || isEnglishLocale ) {
			noticeText = translate(
				"This domain is your site's main address. You can forward subdomains or {{a}}set a new primary site address{{/a}} to forward the root domain.",
				{
					components: {
						a: <a href={ `/domains/manage/${ domain.domain }` } />,
					},
				}
			);
		} else {
			return;
		}

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

	const redirectHasChanged = ( forwarding: DomainForwardingObject ) => {
		if ( ! forwarding ) {
			return false;
		}

		if ( forwarding.target_host + forwarding.target_path !== targetUrl ) {
			return true;
		}

		if ( ( forwarding.is_secure ? 'https' : 'http' ) !== protocol ) {
			return true;
		}

		if ( forwarding.is_permanent !== isPermanent ) {
			return true;
		}

		if ( forwarding.forward_paths !== forwardPaths ) {
			return true;
		}

		if ( forwarding.domain !== subdomain ) {
			return true;
		}

		return false;
	};

	const FormViewRow = ( { child: child }: { child: DomainForwardingObject } ) => (
		<FormFieldset
			className="domain-forwarding-card__fields"
			key={ `view-${ child.domain_redirect_id }` }
		>
			<div className="domain-forwarding-card__fields-row">
				<div className="domain-forwarding-card__fields-column">
					<Badge type={ child.subdomain === '' ? 'warning' : 'info' }>
						{ child.subdomain !== ''
							? translate( 'Subdomain forwarding' )
							: translate( 'Domain forwarding' ) }
					</Badge>
				</div>
				<div className="domain-forwarding-card__fields-column">
					<Button
						borderless
						className="edit-redirect-button link-button"
						onClick={ () => handleEdit( child ) }
					>
						{ translate( 'Edit' ) }
					</Button>
				</div>
			</div>

			<div className="domain-forwarding-card__fields-row addresses">
				<div className="domain-forwarding-card__fields-column source">
					{ translate( 'Source URL' ) }:
				</div>
				<div className="domain-forwarding-card__fields-column destination">
					<strong>{ child.subdomain ? child.subdomain + '.' + child.domain : child.domain }</strong>
				</div>
			</div>

			<div className="domain-forwarding-card__fields-row addresses">
				<div className="domain-forwarding-card__fields-column source">
					{ translate( 'Destination URL' ) }:
				</div>
				<div className="domain-forwarding-card__fields-column destination">
					<strong>
						{ ( child.is_secure ? 'https://' : 'http://' ) + child.target_host + child.target_path }
					</strong>
				</div>
			</div>
		</FormFieldset>
	);

	const FormRowEdditable = ( { child }: { child: DomainForwardingObject } ) => (
		<>
			<FormFieldset
				className="domain-forwarding-card__fields"
				key={ `edit-${ child.domain_redirect_id }` }
			>
				<FormLabel>{ translate( 'Source URL' ) }</FormLabel>
				<div
					className={ clsx( 'forwards-from', {
						'has-subdomain-selector':
							sourceType === 'domain' ||
							( ! checkIfIsThereMainDomainForwarding() && pointsToWpcom ),
					} ) }
				>
					<FormTextInputWithAffixes
						placeholder={ sourceType === 'domain' ? domain.domain : translate( 'Enter subdomain' ) }
						disabled={ isLoading || sourceType === 'domain' }
						name="origin"
						onChange={ handleSubdomainChange }
						value={ sourceType === 'domain' ? domain.domain : subdomain }
						className={ clsx( { 'is-error': ! isValidUrl } ) }
						maxLength={ 1000 }
						prefix={
							( ( child.subdomain === '' && child.domain_redirect_id !== 0 ) ||
								! checkIfIsThereMainDomainForwarding() ) &&
							pointsToWpcom && (
								<FormSelect
									name="redirect_type"
									value={ sourceType }
									onChange={ handleDomainSubdomainChange }
									disabled={ isLoading || isPrimaryDomain }
								>
									<option value="domain">{ translate( 'Domain' ) }</option>
									<option value="subdomain">{ translate( 'Subdomain' ) }</option>
								</FormSelect>
							)
						}
						suffix={ sourceType === 'subdomain' && <FormLabel>.{ domain.domain }</FormLabel> }
					/>
				</div>
				<FormLabel>{ translate( 'Destination URL' ) }</FormLabel>
				<div className="forwards-to">
					<FormTextInputWithAffixes
						disabled={ isLoading }
						name="destination"
						noWrap
						onChange={ handleForwardToChange }
						onBlur={ forwardValidation }
						value={ targetUrl }
						className={ clsx( { 'is-error': ! isValidUrl } ) }
						maxLength={ 1000 }
						suffix={
							child.target_host + child.target_path !== '' &&
							pointsToWpcom && (
								<Button className="forwarding__clear" onClick={ cleanForwardingInput }>
									<Gridicon icon="cross" />
								</Button>
							)
						}
					/>
					<Button
						className={ clsx( 'forwarding__checkmark', {
							visible: pointsToWpcom && isValidUrl && child.target_host + child.target_path !== '',
						} ) }
					>
						<Gridicon icon="checkmark" />
					</Button>
				</div>
				{ ! isValidUrl && (
					<div className="domain-forwarding-card__error-field">
						<FormInputValidation isError text={ errorMessage } />
					</div>
				) }
				<Accordion title={ translate( 'Advanced settings', { textOnly: true } ) }>
					<p className="accordion__title">{ translate( 'Redirect type' ) }</p>
					<p className="accordion__subtitle">{ translate( 'Select the HTTP redirect type' ) }</p>
					<FormLabel>
						<FormRadio
							name="redirect_type"
							value="0"
							checked={ ! isPermanent }
							onChange={ () => {
								setIsPermanent( false );
							} }
							label={ translate( 'Temporary redirect (307)' ) }
						/>
					</FormLabel>
					<FormSettingExplanation>
						{ translate( 'Enables quick propagation of changes to your forwarding address.' ) }
					</FormSettingExplanation>
					<FormLabel>
						<FormRadio
							name="redirect_type"
							value="0"
							checked={ isPermanent }
							onChange={ () => {
								setIsPermanent( true );
							} }
							label={ translate( 'Permanent redirect (301)' ) }
						/>
					</FormLabel>
					<FormSettingExplanation>
						{ translate(
							'Enables browser caching of the forwarding address for quicker resolution. Note that changes might take longer to fully propagate.'
						) }
					</FormSettingExplanation>

					<p className="accordion__title path__forwarding">{ translate( 'Path forwarding' ) }</p>
					<p className="accordion__subtitle">
						{ translate(
							'Redirects the path after the domain name to the corresponding path at the new address.'
						) }
					</p>
					<FormLabel>
						<FormRadio
							name="path_forwarding"
							value="0"
							checked={ ! forwardPaths }
							onChange={ () => {
								setForwardPaths( false );
							} }
							label={ translate( 'Do not forward' ) }
						/>
					</FormLabel>
					<FormSettingExplanation>
						<strong>{ domain.domain }</strong>/{ translate( 'somepage.html' ) }
						{ ` -> ${ targetUrl.replace( /^\/|\/$/g, '' ) }` }
					</FormSettingExplanation>
					<FormLabel>
						<FormRadio
							name="path_forwarding"
							value="0"
							checked={ forwardPaths }
							onChange={ () => {
								setForwardPaths( true );
							} }
							label={ translate( 'Forward path' ) }
						/>
					</FormLabel>
					<FormSettingExplanation>
						<strong>{ domain.domain }</strong>/{ translate( 'somepage.html' ) }
						{ ` -> ${ targetUrl.replace( /^\/|\/$/g, '' ) }` }/{ translate( 'somepage.html' ) }
					</FormSettingExplanation>
				</Accordion>
				{ child.domain_redirect_id !== 0 && (
					<Button
						borderless
						className="remove-redirect-button  link-button"
						onClick={ () => handleDelete() }
					>
						{ translate( 'Remove forward' ) }
					</Button>
				) }
				<div>
					<FormButton
						onClick={ handleSubmit }
						disabled={
							! isValidUrl ||
							isLoading ||
							( forwarding && ! redirectHasChanged( child ) ) ||
							targetUrl === ''
						}
					>
						{ child.domain_redirect_id === 0 ? translate( 'Create' ) : translate( 'Save' ) }
					</FormButton>
					<FormButton onClick={ () => setEditingId( 0 ) } type="button" isPrimary={ false }>
						{ translate( 'Cancel' ) }
					</FormButton>
				</div>
			</FormFieldset>
		</>
	);

	const shouldEdit = ( item: DomainForwardingObject ) => {
		if ( item.domain_redirect_id === editingId ) {
			return true;
		}

		return false;
	};

	return (
		<>
			{ renderNotice() }
			{ renderNoticeForPrimaryDomain() }
			{ forceReloadDns && <QueryDomainDns domain={ domain.name } forceReload /> }
			<form
				onSubmit={ ( e ) => {
					e.preventDefault();
					return false;
				} }
			>
				{ data?.map( ( item ) =>
					shouldEdit( item ) ? FormRowEdditable( { child: item } ) : FormViewRow( { child: item } )
				) }
				{ editingId === -1 &&
					FormRowEdditable( {
						child: {
							domain_redirect_id: 0,
							domain: '',
							subdomain: '',
							target_host: '',
							target_path: '',
							is_secure: true,
							forward_paths: false,
							is_permanent: false,
							is_active: true,
							source_path: '',
						},
					} ) }
			</form>
			{ editingId !== -1 && (
				<Button
					borderless
					className="add-forward-button  link-button"
					onClick={ () => handleAddForward() }
				>
					{ translate( '+ Add forward' ) }
				</Button>
			) }
		</>
	);
}
