import { Button, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type AnalysisType = 'human' | 'ai' | 'full';

type Props = {
	site: string | null;
	onClose: () => void;
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
	site,
	onSelect,
}: {
	site: string;
	onSelect: ( type: AnalysisType ) => void;
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
		<div className="amplify-analysis-options">
			<p className="amplify-analysis-site">
				{ sprintf(
					/* translators: %s is the site URL being audited. */
					__( 'Auditing %s' ),
					site
				) }
			</p>
			<ul className="amplify-analysis-list">
				{ options.map( ( opt ) => (
					<li key={ opt.type }>
						<button
							type="button"
							className="amplify-analysis-option"
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
		</div>
	);
}

function ProgressAnalysis( {
	site,
	type,
	onDismiss,
}: {
	site: string;
	type: AnalysisType;
	onDismiss: () => void;
} ) {
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
			<h2 className="amplify-analysis-progress-title">{ __( 'Analysis in progress' ) }</h2>
			<p className="amplify-analysis-progress-body">
				{ sprintf(
					/* translators: %1$s is the analysis type, %2$s is the site URL. */
					__(
						'Running %1$s for %2$s. This may take 10–20 minutes depending on the size of your site.'
					),
					typeLabels[ type ],
					site
				) }
			</p>
			<p className="amplify-analysis-progress-body">
				{ __(
					'You can navigate away — we’ll let you know when your report is ready for download.'
				) }
			</p>
			<div className="amplify-analysis-progress-bar" aria-hidden="true">
				<div className="amplify-analysis-progress-fill" />
			</div>
			<Button __next40pxDefaultSize variant="primary" onClick={ onDismiss }>
				{ __( 'Got it, run in background' ) }
			</Button>
		</div>
	);
}

export default function AmplifyAnalysisModal( { site, onClose }: Props ) {
	const dispatch = useDispatch();
	const [ stage, setStage ] = useState< 'choose' | 'progress' >( 'choose' );
	const [ selectedType, setSelectedType ] = useState< AnalysisType | null >( null );

	// Reset internal state whenever the modal opens for a new site.
	useEffect( () => {
		if ( site ) {
			setStage( 'choose' );
			setSelectedType( null );
		}
	}, [ site ] );

	if ( ! site ) {
		return null;
	}

	const handleSelectType = ( type: AnalysisType ) => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_analysis_start', {
				analysis_type: type,
				site_url: site,
			} )
		);
		setSelectedType( type );
		setStage( 'progress' );
	};

	return (
		<Modal
			title={ stage === 'choose' ? __( 'Choose your analysis' ) : __( 'Analysis in progress' ) }
			onRequestClose={ onClose }
			className="amplify-analysis-modal"
		>
			{ stage === 'choose' && <ChooseAnalysis site={ site } onSelect={ handleSelectType } /> }
			{ stage === 'progress' && selectedType && (
				<ProgressAnalysis site={ site } type={ selectedType } onDismiss={ onClose } />
			) }
		</Modal>
	);
}
