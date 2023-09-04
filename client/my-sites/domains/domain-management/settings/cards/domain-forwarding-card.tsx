import { Button, FormInputValidation, Gridicon } from '@automattic/components';
import { localizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import { hasTranslation } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CAPTURE_URL_RGX_SOFT } from 'calypso/blocks/import/util';
import Accordion from 'calypso/components/domains/accordion';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import useDeleteDomainForwardingMutation from 'calypso/data/domains/forwarding/use-delete-domain-forwarding-mutation';
import useDomainForwardingQuery from 'calypso/data/domains/forwarding/use-domain-forwarding-query';
import useUpdateDomainForwardingMutation from 'calypso/data/domains/forwarding/use-update-domain-forwarding-mutation';
import { withoutHttp } from 'calypso/lib/url';
import { MAP_EXISTING_DOMAIN } from 'calypso/lib/url/support';
import { useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `domain-forwarding-notification`,
};

export default function DomainForwardingCard( { domain }: { domain: ResponseDomain } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const { data: forwarding, isLoading, isError } = useDomainForwardingQuery( domain.name );

	// Manage local state for target url and protocol as we split forwarding target into host, path and protocol when we store it
	const [ subdomain, setSubdomain ] = useState( '' );
	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ sourceType, setSourceType ] = useState( 'domain' );
	const [ isValidUrl, setIsValidUrl ] = useState( true );
	const [ forwardPaths, setForwardPaths ] = useState( false );
	const [ isPermanent, setIsPermanent ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const pointsToWpcom = domain.pointsToWpcom;
	const isDomainOnly = useSelector( ( state ) => isDomainOnlySite( state, domain.blogId ) );
	const protocol = 'https';

	// Display success notices when the forwarding is updated
	const { updateDomainForwarding } = useUpdateDomainForwardingMutation( domain.name, {
		onSuccess() {
			dispatch(
				successNotice( translate( 'Domain forward updated and enabled.' ), noticeOptions )
			);
		},
		onError() {
			dispatch(
				errorNotice(
					translate( 'An error occurred while updating the domain forward.' ),
					noticeOptions
				)
			);
		},
	} );

	// Display success notices when the forwarding is deleted
	const { deleteDomainForwarding } = useDeleteDomainForwardingMutation( domain.name, {
		onSuccess() {
			setTargetUrl( '' );
			dispatch(
				successNotice( translate( 'Domain forward deleted successfully.' ), noticeOptions )
			);
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

	// Load saved forwarding into local state
	useEffect( () => {
		if ( isLoading || ! forwarding ) {
			setTargetUrl( '' );
			return;
		}

		try {
			const origin =
				( forwarding.isSecure ? 'http://' : 'https://' ) +
				( forwarding.targetHost ?? '_invalid_.domain' );
			const url = new URL( forwarding.targetPath, origin );
			if ( url.hostname !== '_invalid_.domain' ) {
				setTargetUrl( url.hostname + url.pathname + url.search + url.hash );
				setIsPermanent( forwarding.isPermanent );
				setForwardPaths( forwarding.forwardPaths );
				setSubdomain( forwarding.subdomain );
				setSourceType( forwarding.subdomain !== '' ? 'subdomain' : 'domain' );
			}
		} catch ( e ) {
			// ignore
		}
	}, [ isLoading, forwarding, setTargetUrl ] );

	const handleSubdomainChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const subdomain = event.target.value;
		setSubdomain( withoutHttp( subdomain ) );

		const CAPTURE_SUBDOMAIN_RGX = /^(?!-)[a-zA-Z0-9-]{0,63}(?<!-)$/i;

		if ( subdomain.length > 0 && ! CAPTURE_SUBDOMAIN_RGX.test( subdomain ) ) {
			setIsValidUrl( false );
			setErrorMessage( translate( 'Please enter a valid subdomain name.' ) );
			return;
		}

		setIsValidUrl( true );
	};

	const handleForwardToChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const inputUrl = event.target.value;
		setTargetUrl( withoutHttp( inputUrl ) );

		if ( inputUrl.length > 0 && ! CAPTURE_URL_RGX_SOFT.test( protocol + '://' + inputUrl ) ) {
			setIsValidUrl( false );
			setErrorMessage( translate( 'Please enter a valid URL.' ) );
			return;
		}

		try {
			const url = new URL( protocol + '://' + inputUrl );

			// Disallow subdomain forwardings to the main domain, e.g. www.example.com => example.com
			// Disallow same domain forwardings (for now, this may change in the future)
			if ( url.hostname === domain.name || url.hostname.endsWith( `.${ domain.name }` ) ) {
				setErrorMessage( translate( 'Forwarding to the same domain is not allowed.' ) );
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

	const handleDelete = () => {
		setTargetUrl( '' );
		setSubdomain( '' );
		setIsValidUrl( true );

		if ( isLoading || ! forwarding ) {
			return;
		}
		deleteDomainForwarding( forwarding?.domain_redirect_id );
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

		// Validate we have a valid url from the user
		try {
			const url = new URL( protocol + '://' + targetUrl, 'https://_domain_.invalid' );
			if ( url.origin !== 'https://_domain_.invalid' ) {
				targetHost = url.hostname;
				targetPath = url.pathname + url.search + url.hash;
				isSecure = url.protocol === 'https:';
			}
		} catch ( e ) {
			// ignore
		}

		updateDomainForwarding( {
			domain_redirect_id: forwarding?.domain_redirect_id || 0,
			subdomain: sourceType === 'subdomain' ? subdomain : '',
			targetHost,
			targetPath,
			isSecure,
			forwardPaths,
			isPermanent,
			isActive: true, // v1 always active
			sourcePath: null, // v1 always using domain only
		} );

		return false;
	};

	const renderNotice = () => {
		if ( pointsToWpcom ) {
			return null;
		}

		const newNoticeText =
			'To enable domain forwarding please "restore default A records." {{a}}Learn more{{/a}}.';

		let noticeText;
		if ( hasTranslation( newNoticeText ) || isEnglishLocale ) {
			noticeText = translate(
				'To enable domain forwarding please "restore default A records." {{a}}Learn more{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl(
									'https://wordpress.com/support/domains/custom-dns/#default-records'
								) }
							/>
						),
					},
				}
			);
		} else {
			noticeText = translate(
				'Connect your domain to WordPress.com to enable domain forwarding. {{a}}Learn more{{/a}}.',
				{
					components: {
						a: <a href={ localizeUrl( MAP_EXISTING_DOMAIN ) } />,
					},
				}
			);
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

	const renderNoticeForPrimaryDomain = () => {
		if ( ! domain?.isPrimary || isDomainOnly ) {
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
				<div className="domain-forwarding-card-notice__message">
					{ translate(
						'Domains set as the {{strong}}primary site address{{/strong}} can not be forwarded. To forward this domain, please {{a}}set a new primary site address{{/a}}.',
						{
							components: {
								strong: <strong />,
								a: <a href={ `/domains/manage/${ domain.domain }` } />,
							},
						}
					) }
				</div>
			</div>
		);
	};

	const redirectHasChanged = () => {
		if ( ! forwarding ) {
			return false;
		}

		if ( forwarding.targetHost + forwarding.targetPath !== targetUrl ) {
			return true;
		}

		if ( ( forwarding.isSecure ? 'https' : 'http' ) !== protocol ) {
			return true;
		}

		if ( forwarding.isPermanent !== isPermanent ) {
			return true;
		}

		if ( forwarding.forwardPaths !== forwardPaths ) {
			return true;
		}

		if ( forwarding.domain !== subdomain ) {
			return true;
		}

		return false;
	};

	const isDomainForwardDisabled = ( domain?.isPrimary && ! isDomainOnly ) || ! pointsToWpcom;

	return (
		<>
			{ renderNotice() }
			{ renderNoticeForPrimaryDomain() }
			<form onSubmit={ handleSubmit }>
				<FormFieldset
					disabled={ isDomainForwardDisabled }
					className="domain-forwarding-card__fields"
				>
					<FormLabel>{ translate( 'Source URL' ) }</FormLabel>
					<div className="forwards-from">
						<FormTextInputWithAffixes
							placeholder={
								sourceType === 'domain' ? domain.domain : translate( 'Enter subdomain' )
							}
							disabled={ isLoading || sourceType === 'domain' }
							name="origin"
							onChange={ handleSubdomainChange }
							value={ sourceType === 'domain' ? domain.domain : subdomain }
							className={ classNames( { 'is-error': ! isValidUrl } ) }
							maxLength={ 1000 }
							prefix={
								<FormSelect
									name="redirect_type"
									value={ sourceType }
									onChange={ handleDomainSubdomainChange }
									disabled={ isLoading }
								>
									<option value="domain">{ translate( 'Domain' ) }</option>
									<option value="subdomain">{ translate( 'Subdomain' ) }</option>
								</FormSelect>
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
							value={ targetUrl }
							className={ classNames( { 'is-error': ! isValidUrl } ) }
							maxLength={ 1000 }
							suffix={
								targetUrl !== '' &&
								! isDomainForwardDisabled && (
									<Button className="forwarding__clear" onClick={ cleanForwardingInput }>
										<Gridicon icon="cross" />
									</Button>
								)
							}
						/>
						<Button
							className={ classNames( 'forwarding__checkmark', {
								visible: ! isDomainForwardDisabled && isValidUrl && targetUrl !== '',
							} ) }
						>
							<Gridicon icon="checkmark" />
						</Button>
					</div>
					{ ! isValidUrl && (
						<div className="domain-forwarding-card__error-field">
							<FormInputValidation isError={ true } text={ errorMessage } />
						</div>
					) }
					<Accordion title={ translate( 'Advanced settings', { textOnly: true } ) }>
						<p className="accordion__title">{ translate( 'Redirect type' ) }</p>
						<p className="accordion__subtitle">{ translate( 'Select the HTTP redirect type' ) }</p>
						<FormLabel>
							{ /* @ts-expect-error FormRadio is not typed and is causing errors */ }
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
							{ /* @ts-expect-error FormRadio is not typed and is causing errors */ }
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
							{ /* @ts-expect-error FormRadio is not typed and is causing errors */ }
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
							{ /* @ts-expect-error FormRadio is not typed and is causing errors */ }
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
					{ ! isDomainForwardDisabled && forwarding && (
						<Button borderless className="remove-redirect-button" onClick={ () => handleDelete() }>
							{ translate( 'Remove forward' ) }
						</Button>
					) }
				</FormFieldset>
				<FormButton
					disabled={
						isDomainForwardDisabled ||
						! isValidUrl ||
						isLoading ||
						( forwarding && ! redirectHasChanged() ) ||
						targetUrl === ''
					}
				>
					{ translate( 'Save' ) }
				</FormButton>
			</form>
		</>
	);
}
