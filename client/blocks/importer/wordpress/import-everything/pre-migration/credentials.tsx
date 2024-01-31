import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { CredentialsForm } from './credentials-form';
import { CredentialsHelper } from './credentials-helper';
import type { StartImportTrackingProps } from './types';

interface Props {
	sourceSite?: SiteDetails;
	targetSite: SiteDetails;
	migrationTrackingProps: StartImportTrackingProps;
	startImport: ( props?: StartImportTrackingProps ) => void;
	allowFtp: boolean;
}

export function Credentials( props: Props ) {
	const translate = useTranslate();
	const { sourceSite, targetSite, migrationTrackingProps, startImport, allowFtp } = props;
	const [ selectedHost, setSelectedHost ] = useState( 'generic' );
	const [ selectedProtocol, setSelectedProtocol ] = useState< 'ftp' | 'ssh' >(
		allowFtp ? 'ftp' : 'ssh'
	);

	const onChangeProtocol = ( protocol: 'ftp' | 'ssh' ) => {
		setSelectedProtocol( protocol );
	};

	const onHostChange = ( host: string ) => {
		setSelectedHost( host );
	};

	if ( ! sourceSite ) {
		return null;
	}

	return (
		<div className="import__pre-migration import__import-everything import__import-everything--redesign">
			<div className="import__heading import__heading-center">
				<Title>{ translate( 'You are ready to migrate' ) }</Title>
				<SubTitle className="onboarding-subtitle--full-width">
					{
						// translators: %(sourceSite)s and %(targetSite)s are the site slugs - e.g. my-website.wordpress.com
						translate(
							'Provide your SSH server credentials to migrate %(sourceSite)s to %(targetSite)s',
							{
								args: {
									sourceSite: sourceSite?.slug,
									targetSite: targetSite?.slug,
								},
							}
						)
					}
				</SubTitle>
			</div>

			<div className="pre-migration__form-container pre-migration__credentials-form">
				<div className="pre-migration__form">
					<CredentialsForm
						sourceSite={ sourceSite }
						targetSite={ targetSite }
						startImport={ startImport }
						selectedHost={ selectedHost }
						migrationTrackingProps={ migrationTrackingProps }
						onChangeProtocol={ onChangeProtocol }
						allowFtp={ allowFtp }
					/>
				</div>
				<div className="pre-migration__credentials-help">
					<CredentialsHelper onHostChange={ onHostChange } selectedProtocol={ selectedProtocol } />
				</div>
			</div>
		</div>
	);
}
