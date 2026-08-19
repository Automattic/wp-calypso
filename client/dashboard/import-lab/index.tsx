import {
	approveStaticSiteImportSession,
	createSite,
	createStaticSiteImportSession,
	fetchStaticSiteImportSession,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Notice,
	ProgressBar,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, copy } from '@wordpress/icons';
import { useState } from 'react';
import { useAuth } from '../app/auth';
import { Card, CardBody } from '../components/card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import {
	buildImportLabAgentPrompt,
	getImportLabRepository,
	getMshotsUrl,
	normalizeImportLabUrl,
} from './utils';
import type { ImportLabIssueCategory, ImportLabStrategy } from './utils';

import './style.scss';

type TestSite = {
	siteId: number;
	siteSlug: string;
};

const ISSUE_OPTIONS: Array< { label: string; value: ImportLabIssueCategory } > = [
	{ label: __( 'Import journey or Calypso UI' ), value: 'journey' },
	{ label: __( 'Capture or import orchestration' ), value: 'capture' },
	{ label: __( 'Missing or incorrect source content' ), value: 'content' },
	{ label: __( 'Broken block markup or rendering' ), value: 'blocks' },
	{ label: __( 'Screenshots, metrics, or evidence' ), value: 'evidence' },
];

const STRATEGY_OPTIONS: Array< { label: string; value: ImportLabStrategy } > = [
	{ label: __( 'Faithful reconstruction (SSI)' ), value: 'ssi' },
	{ label: __( 'Adapt to an existing WordPress theme (Blueprint)' ), value: 'blueprint' },
];

function MetricList( { metrics }: { metrics?: Record< string, unknown > } ) {
	const entries = Object.entries( metrics ?? {} ).filter(
		( [ , value ] ) => typeof value === 'number' || typeof value === 'boolean'
	);

	if ( entries.length === 0 ) {
		return <p>{ __( 'No metrics are available yet.' ) }</p>;
	}

	const displayValue = ( value: unknown ) => {
		if ( typeof value === 'boolean' ) {
			return value ? __( 'Yes' ) : __( 'No' );
		}
		return String( value );
	};

	return (
		<dl className="import-lab__metrics">
			{ entries.map( ( [ label, value ] ) => (
				<div key={ label }>
					<dt>{ label.replaceAll( '_', ' ' ) }</dt>
					<dd>{ displayValue( value ) }</dd>
				</div>
			) ) }
		</dl>
	);
}

export default function ImportLab() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [ sourceInput, setSourceInput ] = useState( '' );
	const [ sourceUrl, setSourceUrl ] = useState( '' );
	const [ sourceError, setSourceError ] = useState( '' );
	const [ strategy, setStrategy ] = useState< ImportLabStrategy >( 'ssi' );
	const [ testSite, setTestSite ] = useState< TestSite >();
	const [ sessionId, setSessionId ] = useState< string >();
	const [ category, setCategory ] = useState< ImportLabIssueCategory >( 'content' );
	const [ observation, setObservation ] = useState( '' );
	const [ copied, setCopied ] = useState( false );
	const [ screenshotVersion, setScreenshotVersion ] = useState( 0 );
	const createSession = useMutation( {
		mutationFn: ( { siteId, sourceUrl }: { siteId: number; sourceUrl: string } ) =>
			createStaticSiteImportSession( siteId, sourceUrl ),
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
	} );
	const session = useQuery( {
		queryKey: [ 'static-site-import-session', testSite?.siteId, sessionId ],
		queryFn: () => fetchStaticSiteImportSession( testSite!.siteId, sessionId! ),
		enabled: Boolean( testSite && sessionId ),
		refetchInterval: ( query ) =>
			[ 'finished', 'failed' ].includes( query.state.data?.state ?? '' ) ? false : 5000,
		refetchIntervalInBackground: true,
	} );
	const sessionData = session.data ?? createSession.data;
	const destinationUrl = testSite ? `https://${ testSite.siteSlug }` : '';
	const repository = getImportLabRepository( category );

	const startRun = useMutation( {
		mutationFn: async ( normalizedSourceUrl: string ) => {
			const siteTitle = `Import Lab: ${ new URL( normalizedSourceUrl ).hostname }`;
			const created = await createSite( {
				blog_name: siteTitle,
				blog_title: siteTitle,
				public: 1,
				find_available_url: true,
				validate: false,
				locale: user.language,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				options: {
					site_creation_flow: 'import-lab',
					site_intent: 'migration',
					wpcom_public_coming_soon: 0,
					site_information: { title: siteTitle },
				},
			} );
			if ( ! created.success ) {
				throw new Error( 'Test site creation failed.' );
			}
			const site = {
				siteId: created.blog_details.blogid,
				siteSlug: new URL( created.blog_details.url ).hostname,
			};
			if ( strategy === 'blueprint' ) {
				return { site };
			}
			const createdSession = await createSession.mutateAsync( {
				siteId: site.siteId,
				sourceUrl: normalizedSourceUrl,
			} );
			return { site, session: createdSession };
		},
		onSuccess: ( result ) => {
			setTestSite( { siteId: result.site.siteId, siteSlug: result.site.siteSlug } );
			setSessionId( result.session?.session_id );
		},
	} );

	const handleStart = ( event: React.FormEvent ) => {
		event.preventDefault();
		try {
			const normalizedSourceUrl = normalizeImportLabUrl( sourceInput );
			setSourceError( '' );
			setSourceUrl( normalizedSourceUrl );
			startRun.mutate( normalizedSourceUrl );
		} catch {
			setSourceError( __( 'Enter a valid public HTTP or HTTPS URL.' ) );
		}
	};

	const handleApprove = () => {
		if ( ! testSite || ! sessionData?.plan_hash ) {
			return;
		}
		approveSession.mutate( {
			siteId: testSite.siteId,
			activeSessionId: sessionData.session_id,
			planHash: sessionData.plan_hash,
		} );
	};

	const prompt = buildImportLabAgentPrompt( {
		strategy,
		category,
		observation,
		sourceUrl: sourceUrl || sourceInput,
		targetUrl: destinationUrl || 'not created yet',
		sessionId: sessionData?.session_id,
		state: strategy === 'blueprint' && testSite ? 'destination_ready' : sessionData?.state,
		previewSummary: sessionData?.preview_summary,
		receipt: sessionData?.receipt,
	} );

	const handleCopy = async () => {
		await navigator.clipboard.writeText( prompt );
		setCopied( true );
		setTimeout( () => setCopied( false ), 2000 );
	};

	const isWorking =
		startRun.isPending ||
		[ 'capture_queued', 'capturing', 'compiling' ].includes( sessionData?.state ?? '' );
	const canApprove = sessionData?.state === 'preview_ready' && Boolean( sessionData.plan_hash );
	const sourceScreenshot = sourceUrl
		? `${ getMshotsUrl( sourceUrl ) }&lab_capture=${ screenshotVersion }`
		: '';
	const destinationScreenshot = destinationUrl
		? `${ getMshotsUrl( destinationUrl ) }&lab_capture=${ screenshotVersion }`
		: '';

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Import Lab' ) }
					description={ __(
						'Run a real import on an isolated site, inspect the evidence, and turn failures into focused contributions.'
					) }
				/>
			}
		>
			<div className="import-lab">
				<VStack spacing={ 6 }>
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Import Lab is available only to Automatticians. Use public test content and review the destination before approving any import.'
						) }
					</Notice>

					<div className="import-lab__grid">
						<Card className="import-lab__card">
							<CardBody>
								<VStack spacing={ 4 }>
									<Heading level={ 2 }>{ __( '1. Start an isolated import' ) }</Heading>
									<p className="import-lab__intro">
										{ __(
											'Enter a public source site. Import Lab creates a new migration-intent site and prepares the selected workflow without touching an existing site.'
										) }
									</p>
									<SelectControl
										label={ __( 'Import strategy' ) }
										value={ strategy }
										options={ STRATEGY_OPTIONS }
										onChange={ ( value ) => setStrategy( value as ImportLabStrategy ) }
										disabled={ Boolean( testSite ) || startRun.isPending }
										help={
											strategy === 'ssi'
												? __(
														'Compile the source into editable blocks while preserving visual parity.'
												  )
												: __(
														'Extract the source blueprint and map it to the destination theme templates, patterns, and styles.'
												  )
										}
									/>
									<form onSubmit={ handleStart }>
										<VStack spacing={ 3 }>
											<TextControl
												label={ __( 'Source site URL' ) }
												value={ sourceInput }
												onChange={ setSourceInput }
												placeholder="https://example.com"
												disabled={ startRun.isPending }
											/>
											{ sourceError && (
												<Notice status="error" isDismissible={ false }>
													{ sourceError }
												</Notice>
											) }
											<Button
												type="submit"
												variant="primary"
												disabled={
													! sourceInput.trim() || startRun.isPending || Boolean( testSite )
												}
												isBusy={ startRun.isPending }
											>
												{ strategy === 'ssi'
													? __( 'Create test site and capture source' )
													: __( 'Create test site for Blueprint mapping' ) }
											</Button>
										</VStack>
									</form>
									{ startRun.error && (
										<Notice status="error" isDismissible={ false }>
											{ strategy === 'ssi'
												? __( 'The test site or import session could not be created.' )
												: __( 'The test site could not be created.' ) }
										</Notice>
									) }
								</VStack>
							</CardBody>
						</Card>

						<Card className="import-lab__card">
							<CardBody>
								<VStack spacing={ 4 }>
									<Heading level={ 2 }>{ __( '2. Review and continue' ) }</Heading>
									{ strategy === 'ssi' && ! sessionData && ! startRun.isPending && (
										<p>{ __( 'The capture state and preview metrics will appear here.' ) }</p>
									) }
									{ strategy === 'blueprint' && ! testSite && ! startRun.isPending && (
										<p>
											{ __(
												'Blueprint mapping will be available after the test site is created.'
											) }
										</p>
									) }
									{ isWorking && (
										<>
											<HStack justify="flex-start">
												<Spinner />
												<span>{ __( 'Preparing the isolated import…' ) }</span>
											</HStack>
											<ProgressBar />
										</>
									) }
									{ sessionData && (
										<>
											<p>
												<strong>{ __( 'Session state:' ) }</strong> { sessionData.state }
											</p>
											<MetricList metrics={ sessionData.preview_summary } />
											<Button
												variant="primary"
												disabled={ ! canApprove || approveSession.isPending }
												isBusy={ approveSession.isPending }
												onClick={ handleApprove }
											>
												{ __( 'Approve import plan' ) }
											</Button>
										</>
									) }
									{ strategy === 'blueprint' && testSite && (
										<Notice status="success" isDismissible={ false }>
											{ __(
												'The isolated destination is ready. The Blueprint mapper will extract the source model, map it to this theme, and hand the plan to a deterministic executor.'
											) }
										</Notice>
									) }
								</VStack>
							</CardBody>
						</Card>
					</div>

					<Card className="import-lab__card">
						<CardBody>
							<VStack spacing={ 4 }>
								<Heading level={ 2 }>{ __( '3. Compare evidence' ) }</Heading>
								{ sourceUrl && destinationUrl ? (
									<>
										<div className="import-lab__screenshots">
											<figure className="import-lab__screenshot">
												<img src={ sourceScreenshot } alt={ __( 'Source site screenshot' ) } />
												<figcaption>{ __( 'Before: source site' ) }</figcaption>
											</figure>
											<figure className="import-lab__screenshot">
												<img
													src={ destinationScreenshot }
													alt={ __( 'Imported destination screenshot' ) }
												/>
												<figcaption>{ __( 'After: isolated destination' ) }</figcaption>
											</figure>
											<figure className="import-lab__screenshot">
												<div className="import-lab__diff">
													<img src={ sourceScreenshot } alt="" />
													<img src={ destinationScreenshot } alt="" />
												</div>
												<figcaption>{ __( 'Difference: changed pixels' ) }</figcaption>
											</figure>
										</div>
										<Button
											variant="secondary"
											onClick={ () => setScreenshotVersion( Date.now() ) }
										>
											{ __( 'Refresh comparison' ) }
										</Button>
										{ strategy === 'ssi' && (
											<>
												<Heading level={ 3 }>{ __( 'Terminal import receipt' ) }</Heading>
												<MetricList metrics={ sessionData?.receipt } />
											</>
										) }
									</>
								) : (
									<p>
										{ __(
											'Before and after screenshots will appear after the test site is created.'
										) }
									</p>
								) }
							</VStack>
						</CardBody>
					</Card>

					<Card className="import-lab__card">
						<CardBody>
							<VStack spacing={ 4 }>
								<Heading level={ 2 }>{ __( '4. Turn the finding into a contribution' ) }</Heading>
								<SelectControl
									label={ __( 'What needs improvement?' ) }
									value={ category }
									options={ ISSUE_OPTIONS }
									onChange={ ( value ) => setCategory( value as ImportLabIssueCategory ) }
								/>
								<TextareaControl
									label={ __( 'Observed problem' ) }
									value={ observation }
									onChange={ setObservation }
									placeholder={ __( 'Describe what is missing, broken, or measurably different.' ) }
									rows={ 4 }
								/>
								<p>
									<strong>{ __( 'Owning repository:' ) }</strong>{ ' ' }
									{ repository.url ? (
										<a href={ repository.url } target="_blank" rel="noreferrer">
											{ repository.repository }
										</a>
									) : (
										repository.repository
									) }
								</p>
								<ol className="import-lab__steps">
									<li>{ __( 'Open your preferred AI coding agent in the owning repository.' ) }</li>
									<li>
										{ __( 'Copy the evidence-bound prompt below and give it to the agent.' ) }
									</li>
									<li>
										{ __(
											'Review the fix, verification, and AI disclosure before opening the pull request.'
										) }
									</li>
								</ol>
								<pre className="import-lab__prompt">{ prompt }</pre>
								<Button
									variant="secondary"
									icon={ copied ? check : copy }
									onClick={ handleCopy }
									disabled={ ! observation.trim() || ! testSite }
								>
									{ copied ? __( 'Copied' ) : __( 'Copy agent prompt' ) }
								</Button>
							</VStack>
						</CardBody>
					</Card>
				</VStack>
			</div>
		</PageLayout>
	);
}
