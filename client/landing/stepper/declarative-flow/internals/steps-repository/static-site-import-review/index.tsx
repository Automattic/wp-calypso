import { Step } from '@automattic/onboarding';
import { Button, Card, CardBody, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import {
	useCreateStaticSiteImportSession,
	useStaticSiteImportSession,
} from '../static-site-import/hooks/use-static-site-import-session';
import type { Step as StepType } from '../../types';

const StaticSiteImportReview: StepType< {
	submits: {
		action: 'created' | 'approved';
		sessionId: string;
		planHash?: string;
		status: string;
		state: string;
		sourceDigest?: string;
		previewSummary?: Record< string, number >;
	};
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const { siteId } = useSiteData();
	const query = useQuery();
	const sessionId = query.get( 'staticSiteImportSessionId' ) ?? undefined;
	const sourceUrl = query.get( 'from' ) ?? undefined;
	const sessionQuery = useStaticSiteImportSession( siteId, sessionId );
	const createSession = useCreateStaticSiteImportSession();
	const session = sessionId ? sessionQuery.data : createSession.data;
	const error = sessionQuery.error ?? createSession.error;
	const creationRequested = useRef( false );

	const submitSession = useCallback(
		( action: 'created' | 'approved', importSession: NonNullable< typeof session > ) =>
			navigation.submit( {
				action,
				sessionId: importSession.session_id,
				planHash: importSession.plan_hash,
				status: importSession.status,
				state: importSession.state,
				sourceDigest: importSession.source_digest,
				previewSummary: importSession.preview_summary,
			} ),
		[ navigation ]
	);

	useEffect( () => {
		if (
			! sessionId &&
			sourceUrl &&
			siteId > 0 &&
			! creationRequested.current &&
			! createSession.isPending &&
			! session
		) {
			creationRequested.current = true;
			createSession.mutate(
				{ siteId, sourceUrl },
				{
					onSuccess: ( created ) => submitSession( 'created', created ),
				}
			);
		}
	}, [ createSession, session, sessionId, siteId, sourceUrl, submitSession ] );

	const previewCounts = Object.entries( session?.preview_summary ?? {} ).slice( 0, 3 );
	const canApprove = session?.state === 'preview_ready' && Boolean( session.plan_hash );

	return (
		<>
			<DocumentHead title={ translate( 'Review your site import' ) } />
			<Step.CenteredColumnLayout
				columnWidth={ 5 }
				topBar={ <Step.TopBar /> }
				heading={
					<Step.Heading
						text={ translate( 'Review your site import' ) }
						subText={ translate( 'Review the content we found before importing it.' ) }
					/>
				}
			>
				<Card>
					<CardBody>
						{ ! session && ! error && <Spinner /> }
						{ error && (
							<p>{ translate( 'We could not prepare your site import. Please try again.' ) }</p>
						) }
						{ session && (
							<>
								<p>{ translate( 'Your import preview is ready.' ) }</p>
								<ul>
									{ previewCounts.map( ( [ type, count ] ) => (
										<li key={ type }>{ `${ type }: ${ count }` }</li>
									) ) }
								</ul>
								<Button
									variant="primary"
									disabled={ ! canApprove }
									data-testid="static-site-import-approve"
									onClick={ () => submitSession( 'approved', session ) }
								>
									{ translate( 'Approve and start import' ) }
								</Button>
							</>
						) }
					</CardBody>
				</Card>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportReview;
