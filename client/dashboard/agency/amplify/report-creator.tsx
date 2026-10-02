import { startAmplifyReportMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { RadioControl, Spinner, __experimentalHeading as Heading } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, isRTL } from '@wordpress/i18n';
import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import heroBeforeAfter from './hero-before-after.webp';
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
		description: __( 'Clarity, trust, and usability for new visitors.' ),
	},
	{
		value: 'ai',
		label: __( 'AI systems' ),
		description: __( 'How clearly AI systems understand the homepage.' ),
	},
	{
		value: 'full',
		label: __( 'Both' ),
		description: __( 'Both perspectives in one report.' ),
	},
];

const HERO_IMAGES: Record< AmplifyHero, string > = {
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
	const heroImage = HERO_IMAGES[ hero ];
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
	const heroArt = (
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
			aria-labelledby="dashboard-amplify-title"
			ref={ setOverviewNode }
		>
			{ isModal && modalFrame ? createPortal( heroArt, modalFrame ) : ! isModal && heroArt }
			<div className="dashboard-amplify-overview__intro">
				<Heading id="dashboard-amplify-title" level={ 2 }>
					{ __( 'Give your clients a stronger first impression' ) }
				</Heading>
				<div className="dashboard-amplify-overview__summary">
					<Text>
						{ __(
							'See how any public homepage serves first-time visitors and AI systems, with a report highlighting its strengths, gaps, and practical next steps.'
						) }
					</Text>
				</div>
			</div>
			<form className="dashboard-amplify-overview__url-form" onSubmit={ handleSubmit }>
				<div className="dashboard-amplify-overview__url-row">
					<WebsiteAddressPicker
						agencyId={ agencyId }
						label={ __( 'Enter any public URL' ) }
						placeholder={ __( 'Enter a URL or site name' ) }
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
						aria-label={ __( 'Create report' ) }
						aria-busy={ start.isPending }
						disabled={ start.isPending || ! agencyId || atLimit }
					>
						{ start.isPending ? (
							<Spinner />
						) : (
							<Icon icon={ isRTL() ? arrowLeft : arrowRight } size={ 24 } />
						) }
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
					<Heading level={ 3 }>{ __( 'Get a report like this' ) }</Heading>
					<p>
						{ __( 'Improve client sites and impress prospects with specific, actionable ideas.' ) }
					</p>
					<AmplifyScorePreview mode={ mode } />
				</div>
			) }
		</section>
	);
}
