import {
	approveStaticSiteImportSession,
	attachSwitchRun,
	createSite,
	createSwitchRun,
	fetchStaticSiteImportSession,
	fetchSwitchRun,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Notice,
	ProgressBar,
	Spinner,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, copy } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { useAuth } from '../app/auth';
import { Card, CardBody } from '../components/card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import {
	buildSwitchAgentPrompt,
	getMshotsUrl,
	isSwitchRunTerminal,
	isSwitchSessionReadyForReview,
	normalizeSwitchUrl,
} from './utils';
import type { SwitchStrategy } from './utils';

import './style.scss';

type SwitchStep = 'source' | 'analysis' | 'attaching' | 'results' | 'prompt';
type TestSite = { siteId: number; siteSlug: string };

function StepScreen( {
	step,
	title,
	children,
}: {
	step: string;
	title: string;
	children: React.ReactNode;
} ) {
	return (
		<Card className="switch__screen">
			<CardBody>
				<VStack spacing={ 5 }>
					<p className="switch__step">{ step }</p>
					<Heading level={ 2 }>{ title }</Heading>
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);
}

function MetricList( { metrics }: { metrics?: Record< string, unknown > } ) {
	const entries = Object.entries( metrics ?? {} ).filter( ( [ , value ] ) => value !== undefined );
	if ( ! entries.length ) {
		return <p>{ __( 'No metrics are available yet.' ) }</p>;
	}
	return (
		<dl className="switch__metrics">
			{ entries.map( ( [ label, value ] ) => (
				<div key={ label }>
					<dt>{ label.replaceAll( '_', ' ' ) }</dt>
					<dd>{ String( value ) }</dd>
				</div>
			) ) }
		</dl>
	);
}

function messageForError( error?: { code?: string; message?: string } | string ) {
	if ( typeof error === 'string' ) {
		return error;
	}
	return error?.message ?? __( 'Switch could not complete this step.' );
}

export default function Switch() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [ step, setStep ] = useState< SwitchStep >( 'source' );
	const [ sourceInput, setSourceInput ] = useState( '' );
	const [ sourceUrl, setSourceUrl ] = useState( '' );
	const [ sourceError, setSourceError ] = useState( '' );
	const [ runId, setRunId ] = useState< string >();
	const [ strategy, setStrategy ] = useState< SwitchStrategy >( 'ssi' );
	const [ testSite, setTestSite ] = useState< TestSite >();
	const [ sessionId, setSessionId ] = useState< string >();
	const [ isApplying, setIsApplying ] = useState( false );
	const [ copied, setCopied ] = useState( false );
	const [ screenshotVersion, setScreenshotVersion ] = useState( 0 );

	const createRun = useMutation( {
		mutationFn: ( source_url: string ) => createSwitchRun( { source_url } ),
		onSuccess: ( run ) => {
			setRunId( run.run_id );
			setStep( 'analysis' );
		},
	} );
	const runQuery = useQuery( {
		queryKey: [ 'switch-run', runId ],
		queryFn: () => fetchSwitchRun( runId! ),
		enabled: Boolean( runId ),
		refetchInterval: ( query ) => ( isSwitchRunTerminal( query.state.data?.state ) ? false : 5000 ),
		refetchIntervalInBackground: true,
	} );
	const run = runQuery.data ?? createRun.data;
	const analysisMetrics = run?.metrics;

	const attachRun = useMutation( {
		mutationFn: async () => {
			if ( ! runId ) {
				throw new Error( 'Switch analysis run is not available.' );
			}
			let destination = testSite;
			if ( ! destination ) {
				const siteTitle = `Switch: ${ new URL( sourceUrl ).hostname }`;
				const created = await createSite( {
					blog_name: siteTitle,
					blog_title: siteTitle,
					public: 0,
					find_available_url: true,
					validate: false,
					locale: user.language,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					options: {
						site_creation_flow: 'switch',
						site_intent: 'migration',
						wpcom_public_coming_soon: 0,
						site_information: { title: siteTitle },
					},
				} );
				if ( ! created.success ) {
					throw new Error( 'Destination site creation failed.' );
				}
				destination = {
					siteId: created.blog_details.blogid,
					siteSlug: new URL( created.blog_details.url ).hostname,
				};
				setTestSite( destination );
			}
			return attachSwitchRun( runId, { destination_blog_id: destination.siteId } );
		},
		onSuccess: ( attached ) => {
			queryClient.setQueryData( [ 'switch-run', attached.run_id ], attached );
			if ( attached.session_id ) {
				setSessionId( attached.session_id );
			}
		},
	} );
	const session = useQuery( {
		queryKey: [ 'static-site-import-session', testSite?.siteId, sessionId ],
		queryFn: () => fetchStaticSiteImportSession( testSite!.siteId, sessionId! ),
		enabled: Boolean( testSite && sessionId ),
		refetchInterval: ( query ) =>
			[ 'finished', 'failed' ].includes( query.state.data?.state ?? '' ) ? false : 5000,
		refetchIntervalInBackground: true,
	} );
	const approveSession = useMutation( {
		mutationFn: ( {
			siteId,
			activeSessionId,
			planHash,
		}: {
			siteId: number;
			activeSessionId: string;
			planHash: string;
		} ) => approveStaticSiteImportSession( siteId, activeSessionId, planHash ),
		onSuccess: ( approved ) => {
			queryClient.setQueryData(
				[ 'static-site-import-session', testSite?.siteId, approved.session_id ],
				approved
			);
		},
		onError: () => {
			setIsApplying( false );
			setStep( 'results' );
		},
	} );
	const sessionData = session.data;

	useEffect( () => {
		if ( step !== 'attaching' || ! sessionData ) {
			return;
		}
		if ( isSwitchSessionReadyForReview( sessionData.state, isApplying ) ) {
			setIsApplying( false );
			setStep( 'results' );
		}
	}, [ isApplying, sessionData, step ] );

	const destinationUrl = testSite ? `https://${ testSite.siteSlug }` : '';
	const sourceScreenshot = sourceUrl
		? `${ getMshotsUrl( sourceUrl ) }&switch_capture=${ screenshotVersion }`
		: '';
	const destinationScreenshot = destinationUrl
		? `${ getMshotsUrl( destinationUrl ) }&switch_capture=${ screenshotVersion }`
		: '';
	const canApprove = sessionData?.state === 'preview_ready' && Boolean( sessionData.plan_hash );
	const recommendationLabel = run?.recommendation
		? `${ run.recommendation.strategy.toUpperCase() } (${ run.recommendation.confidence })`
		: __( 'No recommendation is available yet.' );
	const prompt = buildSwitchAgentPrompt( {
		strategy,
		category: 'content',
		observation: 'Evaluate this Switch run for source fidelity, editability, and visual parity.',
		sourceUrl,
		targetUrl: destinationUrl || 'not created',
		runId,
		sessionId,
		state: sessionData?.state ?? run?.state,
		recommendation: recommendationLabel,
		analysisMetrics,
		previewSummary: sessionData?.preview_summary,
		receipt: sessionData?.receipt,
	} );

	const handleSource = ( event: React.FormEvent ) => {
		event.preventDefault();
		try {
			const normalized = normalizeSwitchUrl( sourceInput );
			setSourceError( '' );
			setSourceUrl( normalized );
			setStep( 'analysis' );
			createRun.mutate( normalized );
		} catch {
			setSourceError( __( 'Enter a valid public HTTPS URL.' ) );
		}
	};
	const handleAttach = () => {
		attachRun.reset();
		setStep( 'attaching' );
		attachRun.mutate();
	};
	const handleApprove = () => {
		if ( ! testSite || ! sessionData?.plan_hash ) {
			return;
		}
		setIsApplying( true );
		setStep( 'attaching' );
		approveSession.mutate( {
			siteId: testSite.siteId,
			activeSessionId: sessionData.session_id,
			planHash: sessionData.plan_hash,
		} );
	};
	const handleReset = () => {
		setStep( 'source' );
		setSourceInput( '' );
		setSourceUrl( '' );
		setRunId( undefined );
		setTestSite( undefined );
		setSessionId( undefined );
		setIsApplying( false );
		setCopied( false );
		createRun.reset();
		attachRun.reset();
		approveSession.reset();
	};

	let screen: React.ReactNode;
	if ( step === 'source' ) {
		screen = (
			<StepScreen step={ __( 'Step 1 of 5' ) } title={ __( 'What site are you switching?' ) }>
				<form className="switch__form" onSubmit={ handleSource }>
					<VStack spacing={ 4 }>
						<TextControl
							label={ __( 'Public HTTPS URL' ) }
							value={ sourceInput }
							onChange={ setSourceInput }
							placeholder="https://example.com"
						/>
						{ sourceError && (
							<Notice status="error" isDismissible={ false }>
								{ sourceError }
							</Notice>
						) }
						<Button type="submit" variant="primary" disabled={ ! sourceInput.trim() }>
							{ __( 'Analyze site' ) }
						</Button>
					</VStack>
				</form>
			</StepScreen>
		);
	} else if ( step === 'analysis' ) {
		const isTerminal = [ 'failed', 'expired' ].includes( run?.state ?? '' );
		let analysisContent: React.ReactNode;
		if ( createRun.error || runQuery.error || isTerminal ) {
			analysisContent = (
				<>
					<Notice status="error" isDismissible={ false }>
						{ isTerminal
							? messageForError( run?.error )
							: __( 'Switch could not analyze this source. No destination was created.' ) }
					</Notice>
					<Button variant="primary" onClick={ () => createRun.mutate( sourceUrl ) }>
						{ __( 'Try analysis again' ) }
					</Button>
				</>
			);
		} else if ( run?.state !== 'analysis_ready' ) {
			analysisContent = (
				<>
					<HStack justify="flex-start">
						<Spinner />
						<strong>{ __( 'Analyzing the source…' ) }</strong>
					</HStack>
					<ProgressBar />
				</>
			);
		} else {
			analysisContent = (
				<>
					<Heading level={ 3 }>{ __( 'Analysis result' ) }</Heading>
					<MetricList metrics={ analysisMetrics } />
					<p>
						<strong>{ __( 'Server recommendation:' ) }</strong> { recommendationLabel }
					</p>
					{ run.recommendation?.reasons.length ? (
						<ul>
							{ run.recommendation.reasons.map( ( reason ) => (
								<li key={ reason }>{ reason.replaceAll( '_', ' ' ) }</li>
							) ) }
						</ul>
					) : null }
					<div className="switch__strategies">
						<Button
							className="switch__strategy"
							variant="primary"
							onClick={ () => {
								setStrategy( 'ssi' );
								handleAttach();
							} }
						>
							<strong>{ __( 'Faithful reconstruction (SSI)' ) }</strong>
							<span>
								{ __(
									'Use the server-captured artifact to reproduce the source as editable WordPress blocks.'
								) }
							</span>
						</Button>
						<Button className="switch__strategy" disabled>
							<strong>{ __( 'Adapt to a WordPress theme (Blueprint)' ) }</strong>
							<span>
								{ __( 'Blueprint mapping will be available when the mapper is connected.' ) }
							</span>
						</Button>
					</div>
				</>
			);
		}
		screen = (
			<StepScreen step={ __( 'Step 2 of 5' ) } title={ __( 'Analyze the source' ) }>
				<p className="switch__source">{ sourceUrl }</p>
				{ analysisContent }
			</StepScreen>
		);
	} else if ( step === 'attaching' ) {
		const operationError = attachRun.error ?? session.error ?? approveSession.error;
		let runningLabel: React.ReactNode = __( 'Creating an isolated destination…' );
		if ( isApplying ) {
			runningLabel = __( 'Applying the exact approved plan…' );
		} else if ( testSite ) {
			runningLabel = __( 'Attaching the captured artifact…' );
		}
		screen = (
			<StepScreen
				step={ __( 'Step 3 of 5' ) }
				title={
					isApplying
						? __( 'Applying the approved import' )
						: __( 'Create and attach the destination' )
				}
			>
				{ operationError ? (
					<>
						<Notice status="error" isDismissible={ false }>
							{ testSite
								? __(
										'Switch could not complete this step. The existing destination will be reused.'
								  )
								: __( 'Switch could not create a destination.' ) }
						</Notice>
						{ testSite && ! isApplying && (
							<Button variant="primary" onClick={ handleAttach }>
								{ __( 'Retry attach' ) }
							</Button>
						) }
						{ ! testSite && (
							<Button variant="primary" onClick={ handleAttach }>
								{ __( 'Retry destination creation' ) }
							</Button>
						) }
						{ isApplying && (
							<Button variant="primary" onClick={ handleApprove }>
								{ __( 'Retry approval' ) }
							</Button>
						) }
					</>
				) : (
					<>
						<HStack justify="flex-start">
							<Spinner />
							<strong>{ runningLabel }</strong>
						</HStack>
						<ProgressBar />
					</>
				) }
			</StepScreen>
		);
	} else if ( step === 'results' ) {
		screen = (
			<StepScreen step={ __( 'Step 4 of 5' ) } title={ __( 'Review the result' ) }>
				{ sessionData?.state === 'failed' && (
					<Notice status="error" isDismissible={ false }>
						{ __( 'The import failed. The evidence below is still available for diagnosis.' ) }
					</Notice>
				) }
				<p>
					<strong>{ __( 'Destination:' ) }</strong>{ ' ' }
					<a href={ destinationUrl } target="_blank" rel="noreferrer">
						{ destinationUrl }
					</a>
				</p>
				<Heading level={ 3 }>{ __( 'Preview metrics' ) }</Heading>
				<MetricList metrics={ sessionData?.preview_summary } />
				{ sessionData?.receipt && <MetricList metrics={ sessionData.receipt } /> }
				<div className="switch__screenshots">
					<figure>
						<img src={ sourceScreenshot } alt={ __( 'Source site screenshot' ) } />
						<figcaption>{ __( 'Source' ) }</figcaption>
					</figure>
					<figure>
						<img src={ destinationScreenshot } alt={ __( 'Destination site screenshot' ) } />
						<figcaption>{ __( 'WordPress destination' ) }</figcaption>
					</figure>
				</div>
				<HStack className="switch__actions" spacing={ 3 }>
					<Button variant="secondary" onClick={ () => setScreenshotVersion( Date.now() ) }>
						{ __( 'Refresh screenshots' ) }
					</Button>
					{ canApprove && (
						<Button variant="primary" onClick={ handleApprove }>
							{ __( 'Approve and run import' ) }
						</Button>
					) }
					<Button
						variant={ canApprove ? 'secondary' : 'primary' }
						onClick={ () => setStep( 'prompt' ) }
					>
						{ __( 'Continue to prompt' ) }
					</Button>
				</HStack>
			</StepScreen>
		);
	} else {
		screen = (
			<StepScreen step={ __( 'Step 5 of 5' ) } title={ __( 'Continue with an AI coding agent' ) }>
				<p>
					{ __(
						'This evidence-bound prompt includes the Switch run, session, source, destination, recommendation, metrics, and verification guidance.'
					) }
				</p>
				<pre className="switch__prompt">{ prompt }</pre>
				<HStack className="switch__actions" spacing={ 3 }>
					<Button
						variant="primary"
						icon={ copied ? check : copy }
						onClick={ async () => {
							await navigator.clipboard.writeText( prompt );
							setCopied( true );
							setTimeout( () => setCopied( false ), 2000 );
						} }
					>
						{ copied ? __( 'Copied' ) : __( 'Copy prompt' ) }
					</Button>
					<Button variant="secondary" onClick={ () => setStep( 'results' ) }>
						{ __( 'Back to metrics' ) }
					</Button>
					<Button variant="tertiary" onClick={ handleReset }>
						{ __( 'Switch another site' ) }
					</Button>
				</HStack>
			</StepScreen>
		);
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Switch' ) }
					description={ __(
						'Analyze a public source before creating an isolated WordPress destination.'
					) }
				/>
			}
		>
			<div className="switch">{ screen }</div>
		</PageLayout>
	);
}
