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
import { buildSwitchAgentPrompt, getMshotsUrl, normalizeSwitchUrl } from './utils';
import type { SwitchStrategy } from './utils';

import './style.scss';

type SwitchStep = 'source' | 'strategy' | 'running' | 'results' | 'prompt';

type TestSite = {
	siteId: number;
	siteSlug: string;
};

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
		<dl className="switch__metrics">
			{ entries.map( ( [ label, value ] ) => (
				<div key={ label }>
					<dt>{ label.replaceAll( '_', ' ' ) }</dt>
					<dd>{ displayValue( value ) }</dd>
				</div>
			) ) }
		</dl>
	);
}

export default function Switch() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [ step, setStep ] = useState< SwitchStep >( 'source' );
	const [ sourceInput, setSourceInput ] = useState( '' );
	const [ sourceUrl, setSourceUrl ] = useState( '' );
	const [ sourceError, setSourceError ] = useState( '' );
	const [ strategy, setStrategy ] = useState< SwitchStrategy >( 'ssi' );
	const [ testSite, setTestSite ] = useState< TestSite >();
	const [ sessionId, setSessionId ] = useState< string >();
	const [ isApplying, setIsApplying ] = useState( false );
	const [ copied, setCopied ] = useState( false );
	const [ screenshotVersion, setScreenshotVersion ] = useState( 0 );

	const createSession = useMutation( {
		mutationFn: ( { siteId, source }: { siteId: number; source: string } ) =>
			createStaticSiteImportSession( siteId, source ),
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
	const session = useQuery( {
		queryKey: [ 'static-site-import-session', testSite?.siteId, sessionId ],
		queryFn: () => fetchStaticSiteImportSession( testSite!.siteId, sessionId! ),
		enabled: Boolean( testSite && sessionId ),
		refetchInterval: ( query ) =>
			[ 'finished', 'failed' ].includes( query.state.data?.state ?? '' ) ? false : 5000,
		refetchIntervalInBackground: true,
	} );
	const sessionData = session.data ?? createSession.data;

	const runSwitch = useMutation( {
		mutationFn: async ( selectedStrategy: SwitchStrategy ) => {
			const siteTitle = `Switch: ${ new URL( sourceUrl ).hostname }`;
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
					site_creation_flow: 'switch',
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
			setTestSite( site );

			if ( selectedStrategy === 'blueprint' ) {
				return { site, session: undefined };
			}

			const createdSession = await createSession.mutateAsync( {
				siteId: site.siteId,
				source: sourceUrl,
			} );
			return { site, session: createdSession };
		},
		onSuccess: ( result ) => {
			if ( result.session ) {
				setSessionId( result.session.session_id );
			} else {
				setStep( 'results' );
			}
		},
	} );

	useEffect( () => {
		if ( step !== 'running' || strategy !== 'ssi' || ! sessionData ) {
			return;
		}

		if ( ! isApplying && sessionData.state === 'preview_ready' ) {
			setStep( 'results' );
		}
		if ( [ 'finished', 'failed' ].includes( sessionData.state ) ) {
			setIsApplying( false );
			setStep( 'results' );
		}
	}, [ isApplying, sessionData, step, strategy ] );

	const destinationUrl = testSite ? `https://${ testSite.siteSlug }` : '';
	const sourceScreenshot = sourceUrl
		? `${ getMshotsUrl( sourceUrl ) }&switch_capture=${ screenshotVersion }`
		: '';
	const destinationScreenshot = destinationUrl
		? `${ getMshotsUrl( destinationUrl ) }&switch_capture=${ screenshotVersion }`
		: '';
	const canApprove = sessionData?.state === 'preview_ready' && Boolean( sessionData.plan_hash );
	const runError = runSwitch.error ?? createSession.error ?? session.error;
	const prompt = buildSwitchAgentPrompt( {
		strategy,
		category: 'content',
		observation:
			strategy === 'ssi'
				? 'Evaluate this Switch run for content completeness, editability, and visual parity.'
				: 'Evaluate this Switch run for source-blueprint coverage and destination-theme mapping quality.',
		sourceUrl,
		targetUrl: destinationUrl || 'not created',
		sessionId: sessionData?.session_id,
		state: strategy === 'blueprint' && testSite ? 'destination_ready' : sessionData?.state,
		previewSummary: sessionData?.preview_summary,
		receipt: sessionData?.receipt,
	} );
	let runningLabel = __( 'Creating an isolated site…' );
	if ( testSite ) {
		runningLabel = isApplying
			? __( 'Applying the approved import…' )
			: __( 'Capturing and compiling the source…' );
	}

	const handleSource = ( event: React.FormEvent ) => {
		event.preventDefault();
		try {
			const normalized = normalizeSwitchUrl( sourceInput );
			setSourceError( '' );
			setSourceUrl( normalized );
			setStep( 'strategy' );
		} catch {
			setSourceError( __( 'Enter a valid public HTTP or HTTPS URL.' ) );
		}
	};

	const handleStrategy = ( selectedStrategy: SwitchStrategy ) => {
		setStrategy( selectedStrategy );
		setStep( 'running' );
		runSwitch.mutate( selectedStrategy );
	};

	const handleRetry = () => {
		runSwitch.reset();
		createSession.reset();
		if ( testSite && strategy === 'ssi' ) {
			setStep( 'running' );
			createSession.mutate(
				{ siteId: testSite.siteId, source: sourceUrl },
				{ onSuccess: ( created ) => setSessionId( created.session_id ) }
			);
			return;
		}
		handleStrategy( strategy );
	};

	const handleApprove = () => {
		if ( ! testSite || ! sessionData?.plan_hash ) {
			return;
		}
		setIsApplying( true );
		setStep( 'running' );
		approveSession.mutate( {
			siteId: testSite.siteId,
			activeSessionId: sessionData.session_id,
			planHash: sessionData.plan_hash,
		} );
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText( prompt );
		setCopied( true );
		setTimeout( () => setCopied( false ), 2000 );
	};

	const handleReset = () => {
		setStep( 'source' );
		setSourceInput( '' );
		setSourceUrl( '' );
		setTestSite( undefined );
		setSessionId( undefined );
		setIsApplying( false );
		setCopied( false );
		runSwitch.reset();
		createSession.reset();
		approveSession.reset();
	};

	let screen: React.ReactNode;

	if ( step === 'source' ) {
		screen = (
			<StepScreen step={ __( 'Step 1 of 5' ) } title={ __( 'What site are you switching?' ) }>
				<p>
					{ __(
						'Enter the public URL. Switch will create an isolated WordPress site for the run.'
					) }
				</p>
				<form className="switch__form" onSubmit={ handleSource }>
					<VStack spacing={ 4 }>
						<TextControl
							label={ __( 'Site URL' ) }
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
							{ __( 'Continue' ) }
						</Button>
					</VStack>
				</form>
			</StepScreen>
		);
	} else if ( step === 'strategy' ) {
		screen = (
			<StepScreen step={ __( 'Step 2 of 5' ) } title={ __( 'How should Switch build the site?' ) }>
				<p className="switch__source">{ sourceUrl }</p>
				<div className="switch__strategies">
					<Button className="switch__strategy" onClick={ () => handleStrategy( 'ssi' ) }>
						<strong>{ __( 'Faithful reconstruction' ) }</strong>
						<span>{ __( 'Use SSI to reproduce the source as editable WordPress blocks.' ) }</span>
					</Button>
					<Button className="switch__strategy" disabled>
						<strong>{ __( 'Adapt to a WordPress theme' ) }</strong>
						<span>
							{ __( 'Blueprint mapping will be available when the mapper is connected.' ) }
						</span>
					</Button>
				</div>
				<Button variant="tertiary" onClick={ () => setStep( 'source' ) }>
					{ __( 'Back' ) }
				</Button>
			</StepScreen>
		);
	} else if ( step === 'running' ) {
		screen = (
			<StepScreen step={ __( 'Step 3 of 5' ) } title={ __( 'Building the WordPress site' ) }>
				{ runError ? (
					<>
						<Notice status="error" isDismissible={ false }>
							{ __(
								'Switch could not complete this step. The isolated site has not been modified.'
							) }
						</Notice>
						{ destinationUrl && (
							<p>
								{ __( 'Created site:' ) } <a href={ destinationUrl }>{ destinationUrl }</a>
							</p>
						) }
						<Button variant="primary" onClick={ handleRetry }>
							{ __( 'Try again' ) }
						</Button>
					</>
				) : (
					<>
						<HStack justify="flex-start">
							<Spinner />
							<strong>{ runningLabel }</strong>
						</HStack>
						<ProgressBar />
						<p>{ __( 'You can leave this screen open while Switch works.' ) }</p>
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
				<Heading level={ 3 }>{ __( 'Import metrics' ) }</Heading>
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
						'This prompt includes the source, destination, run state, and available metrics.'
					) }
				</p>
				<pre className="switch__prompt">{ prompt }</pre>
				<HStack className="switch__actions" spacing={ 3 }>
					<Button variant="primary" icon={ copied ? check : copy } onClick={ handleCopy }>
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
						'One URL in. An isolated WordPress site, evidence, and next steps out.'
					) }
				/>
			}
		>
			<div className="switch">{ screen }</div>
		</PageLayout>
	);
}
