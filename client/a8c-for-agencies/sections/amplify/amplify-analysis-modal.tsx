/**
 * AmplifyAnalysisModal
 *
 * Two-stage modal flow managed from amplify-page.tsx:
 *   1. AmplifyAddSiteModal  — user picks a site (A4AModal)
 *   2. AmplifyAnalysisModal — user picks analysis type, job is submitted (A4AModal)
 *
 * State lives in amplify-page.tsx so both modals can be mounted/unmounted
 * independently without losing the site selection between them. The page also
 * holds `pendingJobs` so the reports table can show an in-progress row the
 * moment an analysis is kicked off, before the R2 index updates.
 */

import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { A4A_AMPLIFY_REPORTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export type AnalysisType = 'human' | 'ai' | 'full';

/**
 * ⚠️  INTERIM IMPLEMENTATION — READ BEFORE TOUCHING ⚠️
 *
 * This function calls a Cloudflare Worker as a temporary bridge to Trigger.dev
 * while the real WordPress.com backend endpoint is being built. It is NOT the
 * intended long-term approach.
 *
 * SECURITY LIMITATION: amplify_api_secret is stored in the calypso client-side
 * config, which means it is bundled into browser JS and visible to any user who
 * opens devtools. This is acceptable while Amplify is internal-only, but must
 * be resolved before any broader rollout.
 *
 * CLEANUP REQUIRED when POST /wpcom/v2/amplify/analyze is implemented in wpcom:
 *   1. Remove the config() calls for amplify_worker_url and amplify_api_secret.
 *   2. Remove the window.fetch block entirely.
 *   3. Replace this function body with the wpcom.req.post pattern:
 *
 *        import wpcom from 'calypso/lib/wp';
 *        const data = await wpcom.req.post({
 *            apiNamespace: 'wpcom/v2',
 *            path: '/amplify/analyze',
 *            body: { url, mode },
 *        });
 *        return data.jobId;
 *
 *   4. Remove the `config` import if it is no longer used elsewhere.
 *   5. Remove amplify_worker_url and amplify_api_secret from:
 *        config/_shared.json
 *        config/a8c-for-agencies-development.json
 *        config/a8c-for-agencies-production.json
 *   6. Delete workers/amplify-api/ and the related scripts from package.json
 *      in the a4a-amplify repo (full checklist is in that Worker's index.ts).
 */
async function startAmplifyAnalysis( url: string, mode: AnalysisType ): Promise< string > {
	const workerUrl = config< string >( 'amplify_worker_url' );
	const apiSecret = config< string >( 'amplify_api_secret' );

	const response = await window.fetch( `${ workerUrl }/analyze`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${ apiSecret }`,
		},
		body: JSON.stringify( { url, mode } ),
	} );

	if ( ! response.ok ) {
		throw new Error( `Worker responded with ${ response.status }` );
	}

	const data: { jobId: string } = await response.json();
	return data.jobId;
}

/**
 * PendingJob is passed back to amplify-page.tsx via onAnalysisStarted so the
 * reports table can show an in-progress row immediately without waiting for the
 * R2 index to update.
 */
export type PendingJob = {
	jobId: string;
	site: string;
	type: AnalysisType;
	startedAt: string; // ISO timestamp
};

type Props = {
	site: string | null;
	onClose: () => void;
	/** Called as soon as the job is successfully submitted. */
	onAnalysisStarted: ( job: PendingJob ) => void;
};

const ICON_PERSON = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const ICON_SPARKLES = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 3l1.9 5.4L19 11l-5.1 2.6L12 19l-1.9-5.4L5 11l5.1-2.6z" />
		<path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
	</svg>
);

const ICON_TARGET = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="6" />
		<circle cx="12" cy="12" r="2" />
	</svg>
);

type Option = {
	type: AnalysisType;
	title: string;
	description: string;
	iconClass: string;
	icon: React.ReactNode;
};

function ChooseAnalysis( {
	onSelect,
	isSubmitting,
}: {
	onSelect: ( type: AnalysisType ) => void;
	isSubmitting: boolean;
} ) {
	const options: Option[] = [
		{
			type: 'human',
			title: __( 'Human-centric analysis' ),
			description: __( 'Score how potential clients perceive your site when they land on it.' ),
			iconClass: 'is-human',
			icon: ICON_PERSON,
		},
		{
			type: 'ai',
			title: __( 'AI analysis' ),
			description: __(
				'Score how AI tools like ChatGPT, Gemini, and Perplexity read and rank your site.'
			),
			iconClass: 'is-ai',
			icon: ICON_SPARKLES,
		},
		{
			type: 'full',
			title: __( 'Full analysis' ),
			description: __( 'Run both lenses for a complete picture and prompt-ready findings.' ),
			iconClass: 'is-full',
			icon: ICON_TARGET,
		},
	];

	return (
		<ul className="amplify-analysis-list">
			{ options.map( ( opt ) => (
				<li key={ opt.type }>
					<button
						type="button"
						className="amplify-analysis-option"
						disabled={ isSubmitting }
						onClick={ () => onSelect( opt.type ) }
					>
						<span
							className={ clsx( 'amplify-analysis-option-icon', opt.iconClass ) }
							aria-hidden="true"
						>
							{ opt.icon }
						</span>
						<span className="amplify-analysis-option-text">
							<span className="amplify-analysis-option-title">{ opt.title }</span>
							<span className="amplify-analysis-option-description">{ opt.description }</span>
						</span>
						<Icon icon={ chevronRight } size={ 20 } />
					</button>
				</li>
			) ) }
		</ul>
	);
}

function ProgressContent( { site, type }: { site: string; type: AnalysisType } ) {
	const typeLabels: Record< AnalysisType, string > = {
		human: __( 'Human-centric analysis' ),
		ai: __( 'AI analysis' ),
		full: __( 'Full analysis' ),
	};

	return (
		<div className="amplify-analysis-progress">
			<div className="amplify-analysis-progress-icon" aria-hidden="true">
				<div className="amplify-analysis-progress-pulse" />
			</div>
			<p className="amplify-analysis-progress-body">
				{ sprintf(
					/* translators: %1$s is the analysis type, %2$s is the site URL. */
					__(
						'Running %1$s for %2$s. This may take 10 to 20 minutes depending on the size of your site.'
					),
					typeLabels[ type ],
					site
				) }
			</p>
			<p className="amplify-analysis-progress-body">
				{ __(
					'You can navigate away. All your reports can be found in the reports dashboard.'
				) }
			</p>
			<div className="amplify-analysis-progress-bar" aria-hidden="true">
				<div className="amplify-analysis-progress-fill" />
			</div>
		</div>
	);
}

export default function AmplifyAnalysisModal( { site, onClose, onAnalysisStarted }: Props ) {
	const dispatch = useDispatch();
	const [ stage, setStage ] = useState< 'choose' | 'progress' | 'error' >( 'choose' );
	const [ selectedType, setSelectedType ] = useState< AnalysisType | null >( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	// Reset internal state whenever the modal opens for a new site.
	useEffect( () => {
		if ( site ) {
			setStage( 'choose' );
			setSelectedType( null );
			setIsSubmitting( false );
		}
	}, [ site ] );

	if ( ! site ) {
		return null;
	}

	const handleSelectType = async ( type: AnalysisType ) => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_analysis_start', {
				analysis_type: type,
				site_url: site,
			} )
		);
		setSelectedType( type );
		setIsSubmitting( true );

		try {
			const jobId = await startAmplifyAnalysis( site, type );
			// Notify the parent so it can add an in-progress row to the reports
			// table immediately, before the R2 index has a chance to update.
			onAnalysisStarted( {
				jobId,
				site,
				type,
				startedAt: new Date().toISOString(),
			} );
			setStage( 'progress' );
		} catch ( err ) {
			setStage( 'error' );
		} finally {
			setIsSubmitting( false );
		}
	};

	const handleViewReports = () => {
		onClose();
		page( A4A_AMPLIFY_REPORTS_LINK );
	};

	// Title and subtitle vary by stage.
	const modalTitle =
		stage === 'progress'
			? __( 'Analysis in progress' )
			: stage === 'error'
			? __( 'Something went wrong' )
			: __( 'Choose your analysis' );

	const modalSubtitle =
		stage === 'choose'
			? sprintf(
					/* translators: %s is the site URL being analysed. */
					__( 'Run a comprehensive site analysis on %s' ),
					site
			  )
			: null;

	// Footer actions vary by stage.
	const extraActions =
		stage === 'progress' ? (
			<Button __next40pxDefaultSize variant="primary" onClick={ handleViewReports }>
				{ __( 'View reports dashboard' ) }
			</Button>
		) : stage === 'error' ? (
			<Button __next40pxDefaultSize variant="primary" onClick={ () => setStage( 'choose' ) }>
				{ __( 'Try again' ) }
			</Button>
		) : undefined;

	return (
		<A4AModal
			title={ modalTitle }
			subtile={ modalSubtitle }
			onClose={ onClose }
			extraActions={ extraActions }
			// Hide the Cancel button on the progress screen — the CTA does the job.
			showCloseButton={ stage !== 'progress' }
			className="amplify-analysis-modal"
		>
			{ stage === 'choose' && (
				<ChooseAnalysis onSelect={ handleSelectType } isSubmitting={ isSubmitting } />
			) }
			{ stage === 'progress' && selectedType && (
				<ProgressContent site={ site } type={ selectedType } />
			) }
			{ stage === 'error' && (
				<div className="amplify-analysis-error">
					<p className="amplify-analysis-progress-body">
						{ __( 'We were unable to start your analysis. Please try again in a moment.' ) }
					</p>
				</div>
			) }
		</A4AModal>
	);
}
