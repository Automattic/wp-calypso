import { Button, FormInputValidation } from '@automattic/components';
import { localizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import { hasTranslation } from '@wordpress/i18n';
import { Icon, trash, info } from '@wordpress/icons';
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
	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ protocol, setProtocol ] = useState( 'https' );
	const [ isValidUrl, setIsValidUrl ] = useState( true );
	const [ forwardPaths, setForwardPaths ] = useState( false );
	const [ isPermanent, setIsPermanent ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const pointsToWpcom = domain.pointsToWpcom;
	const isDomainOnly = useSelector( ( state ) => isDomainOnlySite( state, domain.blogId ) );

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
			setProtocol( 'https' );
			return;
		}

		try {
			const origin =
				( forwarding.isSecure ? 'http://' : 'https://' ) +
				( forwarding.targetHost ?? '_invalid_.domain' );
			const url = new URL( forwarding.targetPath, origin );
			if ( url.hostname !== '_invalid_.domain' ) {
				setTargetUrl( url.hostname + url.pathname + url.search + url.hash );
				setProtocol( forwarding.isSecure ? 'https' : 'http' );
				setIsPermanent( forwarding.isPermanent );
				setForwardPaths( forwarding.forwardPaths );
			}
		} catch ( e ) {
			// ignore
		}
	}, [ isLoading, forwarding, setTargetUrl, setProtocol ] );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setTargetUrl( withoutHttp( event.target.value ) );

		if (
			event.target.value.length > 0 &&
			! CAPTURE_URL_RGX_SOFT.test( protocol + '://' + event.target.value )
		) {
			setIsValidUrl( false );
			setErrorMessage( translate( 'Please enter a valid URL.' ) );
			return;
		}

		try {
			const url = new URL( protocol + '://' + event.target.value );

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
		setIsValidUrl( true );

		if ( isLoading || ! forwarding ) {
			return;
		}
		deleteDomainForwarding();
	};

	const handleChangeProtocol = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		setProtocol( event.currentTarget.value );
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

		return false;
	};

	return (
		<>
			{ renderNotice() }
			{ renderNoticeForPrimaryDomain() }
			<form onSubmit={ handleSubmit }>
				<FormFieldset
					disabled={ ( domain?.isPrimary && ! isDomainOnly ) || ! pointsToWpcom }
					className="domain-forwarding-card__fields"
				>
					<FormTextInputWithAffixes
						disabled={ isLoading }
						name="destination"
						noWrap
						onChange={ handleChange }
						value={ targetUrl }
						className={ classNames( { 'is-error': ! isValidUrl } ) }
						id="domain-forwarding__input"
						maxLength={ 1000 }
						prefix={
							<FormSelect
								name="protocol"
								id="protocol-type"
								value={ protocol }
								onChange={ handleChangeProtocol }
								disabled={ isLoading }
							>
								<option value="https">https://</option>
								<option value="http">http://</option>
							</FormSelect>
						}
						suffix={
							<Button
								disabled={ isLoading || targetUrl === '' }
								className={ classNames( 'domain-forwarding-card__delete', {
									'is-disabled': isLoading || targetUrl === '',
								} ) }
								onClick={ handleDelete }
							>
								<Icon icon={ trash } size={ 18 } fill="currentColor" />
							</Button>
						}
					/>
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
				</FormFieldset>
				{ ! isValidUrl && (
					<div className="domain-forwarding-card__error-field">
						<FormInputValidation isError={ true } text={ errorMessage } />
					</div>
				) }
				<FormButton
					disabled={
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
