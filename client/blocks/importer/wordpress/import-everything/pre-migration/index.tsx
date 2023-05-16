//create a pre-migration component

import { SiteDetails } from '@automattic/data-stores';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import MigrationCredentialsForm from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/migration-credentials-form';
import './style.scss';
import { FormState } from 'calypso/components/advanced-credentials/form';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { getCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { CredentialsHelper } from './credentials-helper';

interface Props {
	sourceSite: SiteDetails;
	targetSite: SiteDetails;
	startImport: () => void;
}

export const PreMigrationScreen: React.FunctionComponent< Props > = ( props: Props ) => {
	const { startImport, targetSite, sourceSite } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showCredentials, setShowCredentials ] = useState( false );

	const toggleCredentialsForm = () => {
		// Should we trigger provisioning here and have a loading state while we wait for the vaultpress site to be provisioned?
		setShowCredentials( ! showCredentials );
	};

	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, sourceSite.ID, 'main' )
	) as FormState & { abspath: string };

	const hasCredentials = credentials && Object.keys( credentials ).length > 0;

	const isRequestingCredentials = useSelector( ( state ) =>
		isRequestingSiteCredentials( state, sourceSite.ID as number )
	);

	useEffect( () => {
		dispatch( getCredentials( sourceSite.ID ) );
	}, [] );

	function renderCredentialsFormSection() {
		// We do not show the credentials form if we already have credentials
		if ( hasCredentials ) {
			return;
		}

		return (
			<>
				<div className="pre-migration__content pre-migration__credentials">
					Optionally,{ ' ' }
					<button className="action" onClick={ toggleCredentialsForm }>
						provide the server credentials
					</button>{ ' ' }
					site to speed up the migration.
				</div>
				{ showCredentials && (
					<div className="pre-migration__form-container pre-migration__credentials-form">
						<div className="pre-migration__credentials-help">
							<CredentialsHelper />
						</div>
						<div className="pre-migration__form">
							<MigrationCredentialsForm siteId={ sourceSite.ID } startImport={ startImport } />
						</div>
					</div>
				) }
			</>
		);
	}

	function render() {
		// Show a loading state when we are trying to fetch existing credentials
		if ( isRequestingCredentials ) {
			return <LoadingEllipsis />;
		}

		return (
			<div className="import__pre-migration">
				<div className="pre-migration__content pre-migration__title-container">
					<Title>{ translate( 'You are ready to migrate' ) }</Title>
					<SubTitle>
						{ translate( 'Your entire site %(from)s will be migrated to %(to)s', {
							args: {
								from: convertToFriendlyWebsiteName( sourceSite.URL ),
								to: convertToFriendlyWebsiteName( targetSite.URL ),
							},
						} ) }
					</SubTitle>
				</div>
				{ renderCredentialsFormSection() }
				{ ! showCredentials && (
					<div className="pre-migration__content pre-migration__proceed">
						<NextButton
							type="button"
							className="add-subscriber__form-submit-btn"
							onClick={ startImport }
						>
							{ translate( 'Start migration' ) }
						</NextButton>
					</div>
				) }
			</div>
		);
	}

	return render();
};

export default PreMigrationScreen;
