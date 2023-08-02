import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	topHosts,
	genericInfo,
	getHostInfoFromId,
} from 'calypso/components/advanced-credentials/host-info';
import FormSelect from 'calypso/components/forms/form-select';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	onHostChange: ( host: string ) => void;
	selectedProtocol: 'ftp' | 'ssh';
}

export const CredentialsHelper = ( props: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedProvider, setSelectedProvider ] = useState( 'generic' );

	const handleProviderChange = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		setSelectedProvider( event.target.value );
		dispatch(
			recordTracksEvent( 'calypso_site_migration_helper_select_host', {
				host: event.target.value,
			} )
		);
	};

	useEffect( () => {
		props.onHostChange( selectedProvider );
	}, [ selectedProvider ] );

	const renderHelpText = () => {
		const hostDetails = getHostInfoFromId( selectedProvider );
		if ( selectedProvider === 'generic' || ! hostDetails ) {
			return (
				<>
					{ translate(
						'Read through {{a}}our support site{{/a}} to learn how to obtain your credentials.',
						{
							args: { provider: selectedProvider },
							components: {
								a: (
									<a
										href={ genericInfo.supportLink }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () =>
											dispatch(
												recordTracksEvent( 'calypso_site_migration_helper_support_link_click', {
													host: 'generic',
												} )
											)
										}
									/>
								),
							},
						}
					) }
				</>
			);
		}

		if ( hostDetails.inline ) {
			return translate( 'Check the information icons for details on %(hostName)s', {
				args: {
					hostName: hostDetails?.name,
				},
			} );
		}

		if ( hostDetails.supportLink ) {
			const protocol = props.selectedProtocol === 'ftp' ? 'ftp' : 'sftp';

			const link =
				hostDetails.credentialLinks && hostDetails.credentialLinks[ protocol ]
					? hostDetails.credentialLinks[ protocol ]
					: hostDetails.supportLink;
			return (
				<>
					{ translate(
						'Read through the {{a}}%(hostingProvider)s support site{{/a}} to learn how to obtain your credentials.',
						{
							args: { hostingProvider: hostDetails.name },
							components: {
								a: (
									<a
										href={ link }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ () =>
											dispatch(
												recordTracksEvent( 'calypso_site_migration_helper_support_link_click', {
													host: hostDetails.id,
													protocol,
												} )
											)
										}
									/>
								),
							},
						}
					) }
				</>
			);
		}

		return translate( 'Your hosting provider will be able to supply this information to you.' );
	};

	return (
		<>
			<h3>{ translate( 'Do you need help locating your credentials?' ) }</h3>
			<p>{ translate( "Select your hosting and we'll help you find your server credentials." ) }</p>
			<form>
				<FormSelect
					name="provider"
					id="hosting-provider"
					value={ selectedProvider }
					onChange={ handleProviderChange }
					disabled={ false }
				>
					<option value="generic">{ translate( 'Choose your hosting' ) }</option>
					{ topHosts.map( ( host ) => (
						<option key={ host.id } value={ host.id }>
							{ host.name }
						</option>
					) ) }
				</FormSelect>
			</form>
			<p className="pre-migration__credentials-help-text">{ renderHelpText() }</p>
		</>
	);
};
