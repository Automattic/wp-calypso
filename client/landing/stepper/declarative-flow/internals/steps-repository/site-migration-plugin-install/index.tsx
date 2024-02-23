import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import type { Step } from '../../types';

const SiteMigrationPluginInstall: Step = function SiteMigrationPluginInstall( { navigation } ) {
	const { submit } = navigation;

	const siteId = useSiteIdParam();
	const { __ } = useI18n();

	const installSiteMigrationPlugins = useCallback( async () => {
		if ( ! siteId ) {
			return;
		}

		try {
			await wpcom.req.post(
				`/sites/${ siteId }/plugins/install`,
				{
					apiVersion: '1.2',
				},
				{
					slug: 'migrate-guru',
				}
			);
		} catch ( error ) {
			submit?.( { error } );
			return;
		}

		try {
			await wpcom.req.post(
				`/sites/${ siteId }/plugins/migrate-guru%2fmigrateguru`,
				{
					apiVersion: '1.2',
				},
				{
					active: true,
				}
			);
		} catch ( error ) {
			submit?.( { error } );
			return;
		}

		submit?.();
	}, [ siteId, submit ] );

	useEffect( () => {
		installSiteMigrationPlugins();
	}, [ installSiteMigrationPlugins ] );

	return (
		<>
			<DocumentHead title={ __( 'Installing plugins' ) } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="processing-step"
				stepContent={
					<div className="processing-step">
						<h1 className="processing-step__progress-step">{ __( 'Installing plugins' ) }</h1>
						<LoadingEllipsis />
					</div>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationPluginInstall;
