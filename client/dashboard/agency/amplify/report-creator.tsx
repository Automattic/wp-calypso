import { startAmplifyReportMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { RadioControl, Spinner, __experimentalHeading as Heading } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import heroBeforeAfter from './hero-before-after.webp';
import AmplifyDrawnHeroArt, { AmplifyModalArt, isDrawnHero } from './hero-directions';
import heroExplodedSite from './hero-exploded-site.webp';
import heroPrecisionAudit from './hero-precision-audit.webp';
import AmplifyHeroShader from './hero-shader';
import { WebsiteAddressPicker, getStartErrorMessage } from './scan-form';
import AmplifyScorePreview from './score-preview';
import tracingPaperAudit from './tracing-paper-audit.webp';
import { normalizeAmplifyUrl } from './url';
import type { AmplifyHero, AmplifyHeroTweaks } from './dev-state-controls';
import type { SiteOption } from './scan-form';
import type { AmplifyMode, AmplifyUsage } from '@automattic/api-core';
import type { CSSProperties } from 'react';

const REPORT_MODES: {
	value: AmplifyMode;
	label: string;
	description: string;
}[] = [
	{
		value: 'human',
		label: __( 'First-time visitors' ),
		description: __( 'How the site comes across to someone seeing it for the first time.' ),
	},
	{
		value: 'ai',
		label: __( 'AI systems' ),
		description: __( 'How AI tools like ChatGPT and Perplexity read and rank the site.' ),
	},
	{
		value: 'full',
		label: __( 'Both' ),
		description: __( 'Visitors and AI in one report.' ),
	},
];

const HERO_IMAGES: Partial< Record< AmplifyHero, string > > = {
	tracing: tracingPaperAudit,
	audit: heroPrecisionAudit,
	improve: heroBeforeAfter,
	layers: heroExplodedSite,
};

export default function AmplifyReportCreator( {
	agencyId,
	hero,
	heroTweaks,
	usage,
	initialUrl = '',
	initialMode = 'human',
	isModal = false,
	onCreated,
}: {
	agencyId: number;
	hero: AmplifyHero;
	heroTweaks: AmplifyHeroTweaks;
	usage?: AmplifyUsage;
	initialUrl?: string;
	initialMode?: AmplifyMode;
	isModal?: boolean;
	onCreated: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const start = useMutation( startAmplifyReportMutation( agencyId ) );
	const atLimit = !! usage && usage.used >= usage.limit;
	const [ urlInput, setUrlInput ] = useState( initialUrl );
	const [ urlError, setUrlError ] = useState( '' );
	const [ selectedSite, setSelectedSite ] = useState< string | null >( null );
	const [ mode, setMode ] = useState< AmplifyMode >( initialMode );
	const [ modalFrame, setModalFrame ] = useState< HTMLElement | null >( null );
	const setOverviewNode = useCallback(
		( node: HTMLElement | null ) => {
			if ( isModal ) {
				setModalFrame( node?.closest< HTMLElement >( '.components-modal__frame' ) ?? null );
			}
		},
		[ isModal ]
	);
	const drawnHero = isDrawnHero( hero ) ? hero : null;
	const heroImage = HERO_IMAGES[ hero ] ?? '';
	const heroZoom = heroTweaks.zoom * ( isModal ? 0.88 : 1 );
	const heroStyle = {
		backgroundImage: `url(${ heroImage })`,
		'--amplify-hero-height-scale': heroTweaks.height / 100,
		'--amplify-hero-zoom': `${ heroZoom }%`,
		'--amplify-hero-hue': `${ heroTweaks.hue }deg`,
		'--amplify-hero-saturation': `${ heroTweaks.saturation }%`,
		'--amplify-hero-contrast': `${ heroTweaks.contrast }%`,
		'--amplify-hero-brightness': `${ heroTweaks.brightness }%`,
		'--amplify-hero-blur': `${ heroTweaks.blur }px`,
		'--amplify-hero-fade-start': `${ heroTweaks.fadeStart }%`,
		'--amplify-hero-fade-end': `${ heroTweaks.fadeEnd }%`,
	} as CSSProperties;
	const heroArt = drawnHero ? (
		<div
			className="dashboard-amplify-overview__hero-art"
			data-direction={ hero }
			style={ { '--amplify-hero-height-scale': heroTweaks.height / 100 } as CSSProperties }
			aria-hidden="true"
		>
			<AmplifyDrawnHeroArt hero={ drawnHero } />
		</div>
	) : (
		<div className="dashboard-amplify-overview__hero-art" style={ heroStyle } aria-hidden="true">
			<AmplifyHeroShader
				image={ heroImage }
				strength={ heroTweaks.noiseStrength }
				scale={ heroTweaks.grainSize }
				zoom={ heroZoom }
			/>
		</div>
	);
	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( start.isPending ) {
			return;
		}
		const url = selectedSite ?? normalizeAmplifyUrl( urlInput );
		if ( ! url ) {
			setUrlError( __( 'Enter a valid public website URL.' ) );
			return;
		}
		if ( atLimit ) {
			setUrlError( __( 'You’ve reached the current scan limit. Please try again later.' ) );
			return;
		}
		setUrlError( '' );
		if ( ! isModal ) {
			recordTracksEvent( 'calypso_a4a_amplify_empty_state_url_continue', { mode } );
		}
		recordTracksEvent( 'calypso_a4a_amplify_start_analysis_click', { mode } );
		start.mutate(
			{ url, mode },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Analysis started. Your report is being built.' ), {
						type: 'snackbar',
					} );
					onCreated();
				},
				onError: ( error ) => setUrlError( getStartErrorMessage( error ) ),
			}
		);
	};

	return (
		<section
			className="dashboard-amplify-overview"
			data-context={ isModal ? 'modal' : 'empty' }
			data-hero-art={ isModal && drawnHero ? 'none' : undefined }
			aria-labelledby={ isModal ? undefined : 'dashboard-amplify-title' }
			ref={ setOverviewNode }
		>
			{ /* Returning users get the form alone: the drawn art stays on the first visit. */ }
			{ isModal && modalFrame && ! drawnHero
				? createPortal( heroArt, modalFrame )
				: ! isModal && heroArt }
			{ ! isModal && (
				<div className="dashboard-amplify-overview__intro">
					<Heading id="dashboard-amplify-title" level={ 2 }>
						{ __( 'Win your next client with a report on their homepage' ) }
					</Heading>
					<div className="dashboard-amplify-overview__summary">
						<Text>
							{ __(
								'Enter a prospect’s homepage. You get a branded report on what’s holding it back and how you’d fix it, ready for the pitch.'
							) }
						</Text>
					</div>
				</div>
			) }
			{ isModal && drawnHero && (
				<div className="amplify-modal-art" aria-hidden="true">
					<AmplifyModalArt hero={ drawnHero } />
				</div>
			) }
			<form className="dashboard-amplify-overview__url-form" onSubmit={ handleSubmit }>
				<div className="dashboard-amplify-overview__url-row">
					<WebsiteAddressPicker
						agencyId={ agencyId }
						label={ __( 'Homepage' ) }
						placeholder={ __( 'prospect.com, or one of your client sites' ) }
						idPrefix="amplify-report-connected-site"
						value={ urlInput }
						selectedSite={ selectedSite }
						onChange={ ( value ) => {
							setUrlInput( value );
							setSelectedSite( null );
							setUrlError( '' );
						} }
						onClear={ () => {
							setUrlInput( '' );
							setSelectedSite( null );
							setUrlError( '' );
						} }
						onSelectSite={ ( site: SiteOption ) => {
							setUrlInput( site.hostname );
							setSelectedSite( site.url );
							setUrlError( '' );
						} }
						invalid={ !! urlError }
						portalSuggestions={ isModal }
					/>
					<button
						type="submit"
						className="components-button is-primary dashboard-amplify-overview__submit"
						aria-busy={ start.isPending }
						disabled={ start.isPending || ! agencyId || atLimit }
					>
						{ start.isPending ? <Spinner /> : __( 'Create report' ) }
					</button>
				</div>
				{ urlError && (
					<p className="dashboard-amplify-overview__url-error" role="alert">
						{ urlError }
					</p>
				) }
				{ atLimit && ! urlError && (
					<p className="dashboard-amplify-overview__url-error" role="status">
						{ __( 'You’ve reached the current scan limit. Please try again later.' ) }
					</p>
				) }
			</form>
			<RadioControl
				className="dashboard-amplify-overview__mode-options"
				label={ __( 'Report type' ) }
				selected={ mode }
				options={ REPORT_MODES }
				onChange={ ( selectedMode ) => {
					const nextMode = selectedMode as AmplifyMode;
					setMode( nextMode );
					recordTracksEvent( 'calypso_a4a_amplify_report_type_select', {
						mode: nextMode,
					} );
				} }
			/>
			{ ! isModal && (
				<div className="dashboard-amplify-overview__example">
					<Heading level={ 3 }>{ __( 'What you’ll bring to the pitch' ) }</Heading>
					<p>
						{ __(
							'Scores by category, what’s holding the site back, and an AI-ready prompt to fix each issue.'
						) }
					</p>
					<AmplifyScorePreview mode={ mode } />
				</div>
			) }
		</section>
	);
}
