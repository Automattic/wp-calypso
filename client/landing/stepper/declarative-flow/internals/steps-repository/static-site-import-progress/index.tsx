import { Step } from '@automattic/onboarding';
import { Card, CardBody, ProgressBar, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import {
	useApproveStaticSiteImportSession,
	useStaticSiteImportSession,
} from '../static-site-import/hooks/use-static-site-import-session';
import type { Step as StepType } from '../../types';

const StaticSiteImportProgress: StepType = function () {
	const translate = useTranslate();
	const { siteId } = useSiteData();
	const sessionId = useQuery().get( 'staticSiteImportSessionId' ) ?? undefined;
	const { get, set } = useFlowState();
	const session = useStaticSiteImportSession( siteId, sessionId );
	const approve = useApproveStaticSiteImportSession();
	const approvalRequested = useRef( false );
	const savedSession = get( 'staticSiteImport' );

	useEffect( () => {
		const data = session.data;
		if (
			! data ||
			data.state !== 'preview_ready' ||
			! data.plan_hash ||
			approvalRequested.current ||
			savedSession?.approved
		) {
			return;
		}

		approvalRequested.current = true;
		approve.mutate(
			{ siteId, sessionId: data.session_id, planHash: data.plan_hash },
			{
				onSuccess: ( approvedSession ) =>
					set( 'staticSiteImport', {
						sessionId: approvedSession.session_id,
						planHash: approvedSession.plan_hash,
						status: approvedSession.status,
						state: approvedSession.state,
						sourceDigest: approvedSession.source_digest,
						previewSummary: approvedSession.preview_summary,
						approved: true,
					} ),
			}
		);
	}, [ approve, savedSession?.approved, session.data, set, siteId ] );

	const state = session.data?.state;
	let title = translate( 'Your site import is underway' );
	if ( state === 'finished' ) {
		title = translate( 'Your site import is complete' );
	} else if ( state === 'failed' ) {
		title = translate( 'Your site import could not be completed' );
	}

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 5 }
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ title } /> }
			>
				<Card data-testid="static-site-import-progress">
					<CardBody>
						{ ! session.data && ! session.error && <Spinner /> }
						{ state === 'finished' && <p>{ translate( 'Your imported content is ready.' ) }</p> }
						{ state === 'failed' && (
							<p>{ translate( 'Please try again later or contact support.' ) }</p>
						) }
						{ state && ! [ 'finished', 'failed' ].includes( state ) && <ProgressBar /> }
						{ session.error && <p>{ translate( 'We could not check your import status.' ) }</p> }
					</CardBody>
				</Card>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportProgress;
