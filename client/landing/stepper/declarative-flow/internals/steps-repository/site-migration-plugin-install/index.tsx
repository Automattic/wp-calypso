import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationPluginInstall: Step = function SiteMigrationPluginInstall( {
	navigation,
	data,
} ) {
	const { submit } = navigation;
	const siteId = data?.siteId;
	const siteSlug = data?.siteSlug;
	const { __ } = useI18n();

	useEffect( () => {
		if ( ! siteId || ! siteSlug ) {
			return;
		}

		const installSiteMigrationPlugins = async () => {
			try {
				await wpcomRequest( {
					path: `/sites/${ siteId }/plugins/install`,
					method: 'POST',
					apiVersion: '1.2',
					body: {
						slug: 'migrate-guru',
					},
				} );
			} catch ( error ) {
				submit?.( { error } );
				return;
			}

			try {
				await wpcomRequest( {
					path: `/sites/${ siteId }/plugins/migrate-guru%2fmigrateguru`,
					method: 'POST',
					apiVersion: '1.2',
					body: {
						active: true,
					},
				} );
			} catch ( error ) {
				submit?.( { error } );
				return;
			}

			submit?.();
		};

		installSiteMigrationPlugins();
	}, [ siteId, siteSlug, submit ] );

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
