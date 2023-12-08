import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { CredentialsForm } from './credentials-form';
import { CredentialsHelper } from './credentials-helper';
import type { StartImportTrackingProps } from './types';

interface Props {
	sourceSite?: SiteDetails;
	targetSite: SiteDetails;
	migrationTrackingProps: StartImportTrackingProps;
	startImport: ( props?: StartImportTrackingProps ) => void;
}

export function Credentials( props: Props ) {
	const translate = useTranslate();
	const { sourceSite, targetSite, migrationTrackingProps, startImport } = props;
	const [ selectedHost, setSelectedHost ] = useState( 'generic' );
	const [ selectedProtocol, setSelectedProtocol ] = useState< 'ftp' | 'ssh' >( 'ftp' );

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
			<div className="import__header">
				<FormattedHeader headerText={ translate( 'You are ready to migrate' ) } />
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
					/>
				</div>
				<div className="pre-migration__credentials-help">
					<CredentialsHelper onHostChange={ onHostChange } selectedProtocol={ selectedProtocol } />
				</div>
			</div>
		</div>
	);
}
