import { Button, FormInputValidation } from '@automattic/components';
import { englishLocales, useLocale } from '@automattic/i18n-utils';
import { Icon, trash, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import useDeleteDomainRedirectMutation from 'calypso/data/domains/redirects/use-delete-domain-redirect-mutation';
import useDomainRedirectQuery from 'calypso/data/domains/redirects/use-domain-redirect-query';
import useUpdateDomainRedirectMutation from 'calypso/data/domains/redirects/use-update-domain-redirect-mutation';
import { withoutHttp } from 'calypso/lib/url';
import { WPCOM_DEFAULT_NAMESERVERS_REGEX } from 'calypso/my-sites/domains/domain-management/name-servers/constants';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `domain-redirects-notification`,
};

export default function DomainRedirectCard( {
	domainName,
	nameservers,
}: {
	domainName: string;
	nameservers: string[] | null;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const locale = useLocale();
	const { hasTranslation } = useI18n();

	const { data: redirect, isLoading, isError } = useDomainRedirectQuery( domainName );

	// Manage local state for target url and protocol as we split redirect target into host, path and protocol when we store it
	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ protocol, setProtocol ] = useState( 'https' );
	const [ isValidUrl, setIsValidUrl ] = useState( true );

	// Display success notices when the redirect is updated
	const { updateDomainRedirect } = useUpdateDomainRedirectMutation( domainName, {
		onSuccess() {
			dispatch(
				successNotice( translate( 'Domain redirect updated and enabled.' ), noticeOptions )
			);
		},
		onError() {
			dispatch(
				errorNotice( translate( 'An error occurred while updating the redirect.' ), noticeOptions )
			);
		},
	} );

	// Display success notices when the redirect is deleted
	const { deleteDomainRedirect } = useDeleteDomainRedirectMutation( domainName, {
		onSuccess() {
			setTargetUrl( '' );
			dispatch(
				successNotice( translate( 'Domain redirect deleted successfully.' ), noticeOptions )
			);
		},
		onError() {
			dispatch(
				errorNotice( translate( 'An error occurred while deleting the redirect.' ), noticeOptions )
			);
		},
	} );

	// Render an error if the redirect fails to load
	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while fetching your domain redirects.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	// Load saved redirect into local state
	useEffect( () => {
		if ( isLoading || ! redirect ) {
			setTargetUrl( '' );
			setProtocol( 'https' );
			return;
		}

		try {
			const origin =
				( redirect.isSecure ? 'http://' : 'https://' ) +
				( redirect.targetHost ?? '_invalid_.domain' );
			const url = new URL( redirect.targetPath, origin );
			if ( url.hostname !== '_invalid_.domain' ) {
				setTargetUrl( url.hostname + url.pathname + url.search + url.hash );
				setProtocol( redirect.isSecure ? 'https' : 'http' );
			}
		} catch ( e ) {
			// ignore
		}
	}, [ isLoading, redirect, setTargetUrl, setProtocol ] );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setTargetUrl( withoutHttp( event.target.value ) );
		if (
			event.target.value.length > 0 &&
			! CAPTURE_URL_RGX.test( protocol + '://' + event.target.value )
		) {
			setIsValidUrl( false );
			return;
		}

		setIsValidUrl( true );
	};

	const handleDelete = () => {
		if ( isLoading || ! redirect ) {
			return;
		}
		deleteDomainRedirect();
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
			const url = new URL( protocol + '://' + targetUrl, 'https://_invalid_.domain' );
			if ( url.origin !== 'https://_invalid_.domain' ) {
				targetHost = url.hostname;
				targetPath = url.pathname + url.search + url.hash;
				isSecure = url.protocol === 'https:';
			}
		} catch ( e ) {
			// ignore
		}

		updateDomainRedirect( {
			targetHost,
			targetPath,
			isSecure,
			forwardPaths: true, // v1 always forward paths
			isPermanent: false, // v1 always temporary
			isActive: true, // v1 always active
			sourcePath: null, // v1 always using domain only
		} );

		return false;
	};

	const hasWpcomNameservers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.every( ( nameserver ) => {
			return WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	const renderNotice = () => {
		if ( hasWpcomNameservers() || ! nameservers || ! nameservers.length ) {
			return null;
		}

		const noticeText =
			englishLocales.includes( locale ) ||
			hasTranslation(
				'Domain redirection requires using WordPress.com nameservers.{{br/}}{{a}}Update your nameservers now{{/a}}.'
			)
				? translate(
						'Domain redirection requires using WordPress.com nameservers.{{br/}}{{a}}Update your nameservers now{{/a}}.',
						{
							components: {
								a: <a href="?nameservers=true" />,
								br: <br />,
							},
						}
				  )
				: translate( 'You are not currently using WordPress.com name servers.' );

		return (
			<div className="domain-redirect-card-notice">
				<Icon
					icon={ info }
					size={ 18 }
					className="domain-redirect-card-notice__icon gridicon"
					viewBox="2 2 20 20"
				/>
				<div className="domain-redirect-card-notice__message">{ noticeText }</div>
			</div>
		);
	};

	return (
		<>
			{ renderNotice() }
			<form onSubmit={ handleSubmit }>
				<FormFieldset className="domain-redirect-card__fields">
					<FormTextInputWithAffixes
						disabled={ isLoading }
						name="destination"
						noWrap
						onChange={ handleChange }
						value={ targetUrl }
						className={ classNames( { 'is-error': ! isValidUrl } ) }
						id="domain-redirect__input"
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
								className={ classNames( 'domain-redirect-card__delete', {
									'is-disabled': isLoading || targetUrl === '',
								} ) }
								onClick={ handleDelete }
							>
								<Icon icon={ trash } size={ 18 } />
							</Button>
						}
					/>
				</FormFieldset>
				<p className="domain-redirect-card__error-field">
					{ ! isValidUrl ? (
						<FormInputValidation
							isError={ true }
							text={ translate( 'Please enter a valid URL.' ) }
						/>
					) : (
						' '
					) }
				</p>
				<FormButton
					disabled={
						! isValidUrl ||
						isLoading ||
						( redirect &&
							redirect.targetHost + redirect.targetPath === targetUrl &&
							( redirect.isSecure ? 'https' : 'http' ) === protocol ) ||
						( ! redirect && targetUrl === '' )
					}
				>
					{ translate( 'Save' ) }
				</FormButton>
			</form>
		</>
	);
}
