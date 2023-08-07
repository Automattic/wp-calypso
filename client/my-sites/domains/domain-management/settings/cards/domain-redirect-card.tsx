import { localizeUrl } from '@automattic/i18n-utils';
import { localize, translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
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
} from 'calypso/state/domains/domain-redirects/actions';
import { getDomainRedirect } from 'calypso/state/domains/domain-redirects/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import './style.scss';

interface DomainRedirectCardProps {
	domainName: string;
	redirect?: ReturnType< typeof getDomainRedirect >;
	targetUrl?: string;
}

type PropsFromRedux = ConnectedProps< typeof connector >;

const DomainRedirectCard = ( props: DomainRedirectCardProps & PropsFromRedux ) => {
	const [ targetUrl, setTargetUrl ] = useState( '' );
	const [ protocol, setProtocol ] = useState( props.redirect.secure ? 'https' : 'http' );

	useEffect( () => {
		props.fetchDomainRedirect( props.domainName );
		return () => {
			props.closeDomainRedirectNotice( props.domainName );
		};
	}, [ props.domainName ] );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setTargetUrl( withoutHttp( event.target.value ) );
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		let targetHost = '';
		let targetPath = '';
		let secure = true;
		try {
			const url = new URL( protocol + '://' + targetUrl, 'https://_invalid_.domain' );
			if ( url.origin !== 'https://_invalid_.domain' ) {
				targetHost = url.hostname;
				targetPath = url.pathname + url.search + url.hash;
				secure = url.protocol === 'https:';
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
				secure
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
	const { redirect } = props;
	const { isUpdating, isFetching } = redirect;
	const prefix = (
		<>
			<FormSelect
				name="protocol"
				id="protocol-type"
				value={ protocol }
				onChange={ handleChangeProtocol }
			>
				<option value="https">https://</option>
				<option value="http">http://</option>
			</FormSelect>
		</>
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
					value={ targetUrl || props.targetUrl }
					id="domain-redirect__input"
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
			<FormButton
				disabled={
					isFetching ||
					isUpdating ||
					( props.redirect?.targetUrl === targetUrl &&
						( props.redirect?.secure ? 'https' : 'http' ) === protocol )
				}
			>
				{ translate( 'Update' ) }
			</FormButton>
		</form>
	);
};

const connector = connect(
	( state, ownProps: DomainRedirectCardProps ) => {
		const redirect = getDomainRedirect( state, ownProps.domainName );
		let targetUrl = '';
		try {
			const path = redirect?.targetPath ?? '';
			const origin =
				( redirect?.secure === false ? 'http://' : 'https://' ) +
				( redirect?.targetHost ?? '_invalid_.domain' );
			const url = new URL( path, origin );
			if ( url.hostname !== '_invalid_.domain' ) {
				targetUrl = url.hostname + url.pathname + url.search + url.hash;
			}
		} catch ( e ) {
			// ignore
		}

		return { redirect, targetUrl };
	},
	{
		fetchDomainRedirect,
		updateDomainRedirect,
		closeDomainRedirectNotice,
		successNotice,
		errorNotice,
	}
);

export default connector( localize( DomainRedirectCard ) );
