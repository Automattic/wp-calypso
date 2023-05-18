//create a pre-migration component

import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import MigrationCredentialsForm from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/migration-credentials-form';
import './style.scss';
import { PreMigrationUpgradePlan } from 'calypso/blocks/importer/wordpress/import-everything/pre-migration/upgrade-plan';
import { FormState } from 'calypso/components/advanced-credentials/form';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { getCredentials } from 'calypso/state/jetpack/credentials/actions';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { CredentialsHelper } from './credentials-helper';

interface PreMigrationProps {
	sourceSite: SiteDetails;
	targetSite: SiteDetails;
	startImport: () => void;
	isTargetSitePlanCompatible: boolean;
	onContentOnlyClick: () => void;
}

export const PreMigrationScreen: React.FunctionComponent< PreMigrationProps > = (
	props: PreMigrationProps
) => {
	const { startImport, targetSite, sourceSite, isTargetSitePlanCompatible, onContentOnlyClick } =
		props;

	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showCredentials, setShowCredentials ] = useState( false );
	const [ selectedHost, setSelectedHost ] = useState( 'generic' );
	const [ selectedProtocol, setSelectedProtocol ] = useState< 'ftp' | 'ssh' >( 'ftp' );
	const [ hasLoaded, setHasLoaded ] = useState( false );

	const toggleCredentialsForm = () => {
		setShowCredentials( ! showCredentials );
	};

	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, sourceSite.ID, 'main' )
	) as FormState & { abspath: string };

	const hasCredentials = credentials && Object.keys( credentials ).length > 0;

	const isRequestingCredentials = useSelector( ( state ) =>
		isRequestingSiteCredentials( state, sourceSite.ID as number )
	);

	const changeCredentialsHelperHost = ( host: string ) => {
		setSelectedHost( host );
	};

	const changeCredentialsProtocol = ( protocol: 'ftp' | 'ssh' ) => {
		setSelectedProtocol( protocol );
	};

	useEffect( () => {
		dispatch( getCredentials( sourceSite.ID ) );
		setHasLoaded( true );
	}, [] );

	function renderCredentialsFormSection() {
		// We do not show the credentials form if we already have credentials
		if ( hasCredentials ) {
			return;
		}

		return (
			<>
				<div className="pre-migration__content pre-migration__credentials">
					{ translate(
						'Optionally, {{button}}provide the server credentials{{/button}} of your site to speed up the migration',
						{
							components: {
								button: (
									<Button
										borderless={ true }
										className="action-buttons__content-only"
										onClick={ toggleCredentialsForm }
									/>
								),
							},
						}
					) }
				</div>
				{ showCredentials && (
					<div className="pre-migration__form-container pre-migration__credentials-form">
						<div className="pre-migration__credentials-help">
							<CredentialsHelper
								onHostChange={ changeCredentialsHelperHost }
								selectedProtocol={ selectedProtocol }
							/>
						</div>
						<div className="pre-migration__form">
							<MigrationCredentialsForm
								sourceSiteId={ sourceSite.ID }
								targetSiteId={ targetSite.ID }
								startImport={ startImport }
								selectedHost={ selectedHost }
								onChangeProtocol={ changeCredentialsProtocol }
							/>
						</div>
					</div>
				) }
			</>
		);
	}

	function renderPreMigration() {
		// Show a loading state when we are trying to fetch existing credentials
		if ( ! hasLoaded || isRequestingCredentials ) {
			return <LoadingEllipsis />;
		}

		return (
			<>
				<div className="import__heading-title">
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
					<div className="import__footer-button-container pre-migration__proceed">
						<NextButton type="button" onClick={ startImport }>
							{ translate( 'Start migration' ) }
						</NextButton>
					</div>
				) }
			</>
		);
	}

	function render() {
		if ( isTargetSitePlanCompatible ) {
			return (
				<div
					className={ classnames( 'import__pre-migration import__import-everything', {
						'import__import-everything--redesign': isEnabled( 'onboarding/import-redesign' ),
					} ) }
				>
					{ renderPreMigration() }
				</div>
			);
		}

		return (
			<div
				className={ classnames( 'import__import-everything', {
					'import__import-everything--redesign': isEnabled( 'onboarding/import-redesign' ),
				} ) }
			>
				<PreMigrationUpgradePlan
					sourceSite={ sourceSite }
					targetSite={ targetSite }
					startImport={ startImport }
					onContentOnlyClick={ onContentOnlyClick }
				/>
			</div>
		);
	}

	return render();
};

export default PreMigrationScreen;
