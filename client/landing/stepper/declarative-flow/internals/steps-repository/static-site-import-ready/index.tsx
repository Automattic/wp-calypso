import { isStaticSiteImportError } from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import {
	Panel,
	SourceCard,
	StatusNotice,
	useStaticSiteImportSource,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import '../components/static-site-import/style.scss';

export type StaticSiteImportReadySubmits = { action: 'approved' } | { action: 'restart' };

const StaticSiteImportReady: StepType< { submits: StaticSiteImportReadySubmits } > =
	function StaticSiteImportReady( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const { siteId } = useSiteData();
		const { host, platformName } = useStaticSiteImportSource();

		const { data: session, error: sessionError } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
		} );
		const {
			mutate: approve,
			isPending,
			error: approveError,
		} = useMutation( approveStaticSiteImportSessionMutation() );

		// A session approved in an earlier visit has nothing left to approve here.
		const hasForwarded = useRef( false );
		useEffect( () => {
			if ( hasForwarded.current || ! session ) {
				return;
			}
			if ( [ 'queued', 'finished' ].includes( session.state ) ) {
				hasForwarded.current = true;
				navigation.submit?.( { action: 'approved' } );
			}
		}, [ navigation, session ] );

		const isAlreadyApproved = isStaticSiteImportError(
			approveError,
			'static_site_import_session_already_approved'
		);
		useEffect( () => {
			if ( isAlreadyApproved && ! hasForwarded.current ) {
				hasForwarded.current = true;
				navigation.submit?.( { action: 'approved' } );
			}
		}, [ isAlreadyApproved, navigation ] );

		const isExpired =
			! sessionId ||
			session?.state === 'failed' ||
			isStaticSiteImportError( sessionError, 'static_site_import_session_not_found' ) ||
			isStaticSiteImportError( approveError, 'static_site_import_preview_expired' );
		const hasError =
			! isExpired && ( Boolean( sessionError ) || ( approveError && ! isAlreadyApproved ) );
		const canApprove =
			Boolean( session?.archive_hash && siteId ) && session?.state === 'preview_ready';

		const onMove = () => {
			if ( ! session?.archive_hash || ! siteId ) {
				return;
			}
			approve(
				{ sessionId, archiveHash: session.archive_hash, destinationBlogId: siteId },
				{ onSuccess: () => navigation.submit?.( { action: 'approved' } ) }
			);
		};

		return (
			<>
				<DocumentHead title={ __( 'You’re all set' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--static-site-import-ready"
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'You’re all set' ) }
							subText={ __( 'Your plan is active. Start the move whenever you’re ready.' ) }
						/>
					}
				>
					<div className="static-site-import__stack">
						<SourceCard />
						<Panel title={ __( 'Ready when you are' ) }>
							<p className="static-site-import__muted">
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
							</p>
							{ isExpired && (
								<StatusNotice status="error">
									{ __(
										'It’s been a while since we read your site, so we need to take a fresh look before moving it.'
									) }
								</StatusNotice>
							) }
							{ hasError && (
								<StatusNotice status="error">
									{ __( 'We couldn’t start the move. Please try again.' ) }
								</StatusNotice>
							) }
							{ isExpired ? (
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
						</Panel>
					</div>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportReady;
