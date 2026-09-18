import { getStaticSiteImportErrorCode } from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/dashboard/components/notice';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import {
	ImportCard,
	SourceCard,
	useStaticSiteImportSource,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

export type StaticSiteImportReadySubmits = { action: 'approved' } | { action: 'restart' };

const RESTART_CODES = [
	'static_site_import_session_not_found',
	'static_site_import_preview_expired',
	'static_site_import_archive_mismatch',
];

const StaticSiteImportReady: StepType< { submits: StaticSiteImportReadySubmits } > =
	function StaticSiteImportReady( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const { siteId, siteSlug } = useSiteData();
		const { host, platformName } = useStaticSiteImportSource();

		const {
			data: session,
			error: sessionError,
			refetch,
		} = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
		} );
		const {
			mutate: approve,
			isPending,
			error: approveError,
		} = useMutation( approveStaticSiteImportSessionMutation() );

		const errorCode =
			getStaticSiteImportErrorCode( approveError ) ?? getStaticSiteImportErrorCode( sessionError );
		const isDelivering =
			session?.state === 'queued' ||
			session?.state === 'finished' ||
			( session?.state === 'failed' && Boolean( session.site_url ) );
		const shouldForward =
			isDelivering || errorCode === 'static_site_import_session_already_approved';

		const hasForwarded = useRef( false );
		useEffect( () => {
			if ( shouldForward && ! hasForwarded.current ) {
				hasForwarded.current = true;
				navigation.submit?.( { action: 'approved' } );
			}
		}, [ navigation, shouldForward ] );

		const needsRestart =
			! sessionId ||
			( session?.state === 'failed' && ! session.site_url ) ||
			RESTART_CODES.includes( errorCode ?? '' );
		const hasError = ! needsRestart && ! shouldForward && Boolean( approveError ?? sessionError );
		const canApprove =
			session?.state === 'preview_ready' && Boolean( session.archive_hash && siteId );

		const onMove = () => {
			if ( session?.archive_hash && siteId ) {
				approve(
					{ sessionId, archiveHash: session.archive_hash, destinationBlogId: siteId },
					{ onSuccess: () => navigation.submit?.( { action: 'approved' } ) }
				);
			}
		};

		const errorAction = ( () => {
			if ( errorCode === 'static_site_import_atomic_unavailable' ) {
				return (
					<Button variant="secondary" href={ `/plans/${ siteSlug }` }>
						{ __( 'Upgrade plan' ) }
					</Button>
				);
			}
			if ( sessionError ) {
				return (
					<Button variant="secondary" onClick={ () => refetch() }>
						{ __( 'Try again' ) }
					</Button>
				);
			}
			return null;
		} )();

		const errorMessage =
			{
				static_site_import_atomic_unavailable: __(
					'Your plan can’t host an imported site. Nothing has changed. Upgrade your plan, then come back to start the move.'
				),
				import_exists: __(
					'This site already has an import running. Wait for it to finish, then try again.'
				),
			}[ errorCode ?? '' ] ?? __( 'We couldn’t start the move. Please try again.' );

		return (
			<>
				<DocumentHead title={ __( 'You’re all set' ) } />
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'You’re all set' ) }
							subText={ __( 'Your plan is active. Start the move whenever you’re ready.' ) }
						/>
					}
				>
					<VStack spacing={ 8 }>
						<SourceCard />
						<ImportCard title={ __( 'Ready when you are' ) }>
							<Text variant="muted">
								{ platformName
									? sprintf(
											/* translators: %1$s: the site's domain, e.g. example.com. %2$s: the platform it is hosted on today, e.g. Wix. */
											__(
												'We’ll rebuild %1$s on WordPress.com. Your %2$s site stays exactly as it is.'
											),
											host,
											platformName
										)
									: sprintf(
											/* translators: %s: the site's domain, e.g. example.com. */
											__(
												'We’ll rebuild %s on WordPress.com. Your current site stays exactly as it is.'
											),
											host
										) }
							</Text>
							{ needsRestart && (
								<Notice variant="error">
									{ __(
										'It’s been a while since we read your site, so we need to take a fresh look before moving it.'
									) }
								</Notice>
							) }
							{ hasError && (
								<Notice variant="error" actions={ errorAction }>
									{ errorMessage }
								</Notice>
							) }
							<div>
								{ needsRestart ? (
									<Button
										__next40pxDefaultSize
										variant="primary"
										onClick={ () => navigation.submit?.( { action: 'restart' } ) }
									>
										{ __( 'Read my site again' ) }
									</Button>
								) : (
									<Button
										__next40pxDefaultSize
										variant="primary"
										isBusy={ isPending }
										disabled={ ! canApprove || isPending }
										onClick={ onMove }
									>
										{ __( 'Move my site' ) }
									</Button>
								) }
							</div>
						</ImportCard>
					</VStack>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportReady;
