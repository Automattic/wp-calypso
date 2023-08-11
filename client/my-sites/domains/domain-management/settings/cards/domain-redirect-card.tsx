import { Button, FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, trash } from '@wordpress/icons';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { withoutHttp } from 'calypso/lib/url';
import { DOMAIN_REDIRECT } from 'calypso/lib/url/support';
import {
	closeDomainRedirectNotice,
	fetchDomainRedirect,
	updateDomainRedirect,
	deleteDomainRedirect,
} from 'calypso/state/domains/domain-redirects/actions';
import { getDomainRedirect } from 'calypso/state/domains/domain-redirects/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import './style.scss';

interface DomainRedirectCardProps {
	domainName: string;
	redirect?: ReturnType< typeof getDomainRedirect >;
	target?: string;
}

type PropsFromRedux = ConnectedProps< typeof connector >;

const DomainRedirectCard = ( props: DomainRedirectCardProps & PropsFromRedux ) => {
	const { redirect, target } = props;
	const { isUpdating, isFetching, isFetched } = redirect;
	const [ targetUrl, setTargetUrl ] = useState( target ?? '' );
	const [ protocol, setProtocol ] = useState( redirect.isSecure ? 'https' : 'http' );
	const { domainName, fetchDomainRedirect, closeDomainRedirectNotice } = props;
	const [ isValidUrl, setIsValidUrl ] = useState( true );

	useEffect( () => {
		fetchDomainRedirect( domainName );
		return () => {
			closeDomainRedirectNotice( domainName );
		};
	}, [ domainName, fetchDomainRedirect, closeDomainRedirectNotice ] );

	useEffect( () => {
		if ( isFetched && ! isUpdating ) {
			setTargetUrl( target ?? '' );
			setProtocol( redirect.isSecure ? 'https' : 'http' );
		}
	}, [ isFetched, isUpdating, target, redirect ] );

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
		if ( ! redirect?.domainRedirectId || ! redirect?.targetHost ) {
			return;
		}

		setTargetUrl( '' );

		props
			.deleteDomainRedirect( props.domainName, redirect.domainRedirectId )
			.then( ( success: boolean ) => {
				if ( success ) {
					props.fetchDomainRedirect( props.domainName );

					props.successNotice( translate( 'Site redirect deleted successfully.' ), {
						duration: 5000,
						id: `site-redirect-update-notification`,
					} );
				} else {
					props.errorNotice( props.redirect.notice.text );
				}
			} );
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( targetUrl === '' ) {
			handleDelete();
			return;
		}
		let targetHost = '';
		let targetPath = '';
		let isSecure = true;
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

		props
			.updateDomainRedirect(
				props.domainName,
				targetHost,
				targetPath,
				null, // forwardPaths not supported yet
				isSecure
			)
			.then( ( success: boolean ) => {
				if ( success ) {
					props.fetchDomainRedirect( props.domainName );

					props.successNotice( translate( 'Site redirect updated successfully.' ), {
						duration: 5000,
						id: `site-redirect-update-notification`,
					} );
				} else {
					props.errorNotice( props.redirect.notice.text );
				}
			} );
		return false;
	};

	const handleChangeProtocol = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		setProtocol( event.currentTarget.value );
	};

	const prefix = (
		<>
			<FormSelect
				name="protocol"
				id="protocol-type"
				value={ protocol }
				onChange={ handleChangeProtocol }
				disabled={ isFetching || isUpdating }
			>
				<option value="https">https://</option>
				<option value="http">http://</option>
			</FormSelect>
		</>
	);

	const suffix = (
		<Button
			disabled={ isFetching || isUpdating || ( targetUrl === '' && target === '' ) }
			className={ classNames( 'domain-redirect-card__delete', {
				'is-disabled': isFetching || isUpdating || ( targetUrl === '' && target === '' ),
			} ) }
			onClick={ handleDelete }
		>
			<Icon icon={ trash } size={ 18 } />
		</Button>
	);

	return (
		<form onSubmit={ handleSubmit }>
			<FormFieldset className="domain-redirect-card__fields">
				<FormTextInputWithAffixes
					disabled={ isFetching || isUpdating }
					name="destination"
					noWrap
					onChange={ handleChange }
					prefix={ prefix }
					value={ targetUrl }
					suffix={ suffix }
					id="domain-redirect__input"
					className={ classNames( { 'is-error': ! isValidUrl } ) }
				/>
				<p className="domain-redirect-card__explanation">
					{ translate(
						'Requests to your domain will receive an HTTP redirect here. ' +
							'{{learnMoreLink}}Learn more{{/learnMoreLink}}',
						{
							components: {
								learnMoreLink: (
									<a
										href={ localizeUrl( DOMAIN_REDIRECT ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</FormFieldset>
			<p className="domain-redirect-card__error-field">
				{ ! isValidUrl ? (
					<FormInputValidation isError={ true } text={ translate( 'Please enter a valid URL.' ) } />
				) : (
					' '
				) }
			</p>
			<FormButton
				disabled={
					! isValidUrl ||
					isFetching ||
					isUpdating ||
					( target === targetUrl && ( redirect?.isSecure ? 'https' : 'http' ) === protocol )
				}
			>
				{ translate( 'Save' ) }
			</FormButton>
		</form>
	);
};

const connector = connect(
	( state, ownProps: DomainRedirectCardProps ) => {
		const redirect = getDomainRedirect( state, ownProps.domainName );
		let target = '';
		try {
			const path = redirect?.targetPath ?? '';
			const origin =
				( redirect?.isSecure === false ? 'http://' : 'https://' ) +
				( redirect?.targetHost ?? '_invalid_.domain' );
			const url = new URL( path, origin );
			if ( url.hostname !== '_invalid_.domain' ) {
				target =
					url.hostname + ( url.pathname === '/' ? '' : url.pathname ) + url.search + url.hash;
			}
		} catch ( e ) {
			// ignore
		}

		return { redirect, target };
	},
	{
		fetchDomainRedirect,
		updateDomainRedirect,
		deleteDomainRedirect,
		closeDomainRedirectNotice,
		successNotice,
		errorNotice,
	}
);

export default connector( localize( DomainRedirectCard ) );
