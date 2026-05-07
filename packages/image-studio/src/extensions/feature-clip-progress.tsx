/**
 * Sidebar progress widget — design variant C "step indicator".
 *
 * Shown when videoStudioStore.pendingRender is non-null. Maps the
 * progressPhase to a 3-step pipeline (Analyzing post → Composing scene →
 * Rendering clip) so the user sees concrete progress, not a percentage.
 */
import { Button } from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import {
	store as videoStudioStore,
	type FeatureClipProgressPhase,
	type VideoStudioActions,
} from '../stores/video-studio';

type StepState = 'done' | 'active' | 'pending';

interface Step {
	label: string;
	state: StepState;
}

function phaseToSteps( phase: FeatureClipProgressPhase ): Step[] {
	const labels = [
		__( 'Reading post images', __i18n_text_domain__ ),
		__( 'Composing the clip', __i18n_text_domain__ ),
		__( 'Rendering frames', __i18n_text_domain__ ),
		__( 'Uploading to media library', __i18n_text_domain__ ),
	];
	const phaseToActiveIndex: Record< FeatureClipProgressPhase, number > = {
		idle: 0,
		analyzing: 0,
		composing: 1,
		rendering: 2,
		uploading: 3,
	};
	const activeIndex = phaseToActiveIndex[ phase ] ?? 0;
	const stateForIndex = ( index: number ): StepState => {
		if ( index < activeIndex ) {
			return 'done';
		}
		if ( index === activeIndex ) {
			return 'active';
		}
		return 'pending';
	};
	return labels.map( ( label, index ) => ( { label, state: stateForIndex( index ) } ) );
}

export function FeatureClipProgress(): JSX.Element {
	const phase = useSelect(
		( select ) => select( videoStudioStore ).getFeatureClipProgressPhase(),
		[]
	);
	const isCancelling = useSelect(
		( select ) => select( videoStudioStore ).getFeatureClipIsCancelling(),
		[]
	);

	const steps = phaseToSteps( phase );

	const handleOpenStudio = () => {
		const { openImageStudio } = dispatch( imageStudioStore );
		openImageStudio( undefined, undefined, ImageStudioEntryPoint.PostEditorFeatureClip );
	};

	const handleCancel = () => {
		const { setFeatureClipIsCancelling } = dispatch(
			videoStudioStore
		) as unknown as VideoStudioActions;
		setFeatureClipIsCancelling( true );
	};

	return (
		<div className="image-studio-feature-clip-progress">
			<p className="image-studio-feature-clip-progress__heading">
				{ __( 'Generating clip…', __i18n_text_domain__ ) }
			</p>
			<ol className="image-studio-feature-clip-progress__steps">
				{ steps.map( ( step ) => (
					<li
						key={ step.label }
						className={ `image-studio-feature-clip-progress__step is-${ step.state }` }
					>
						<span className="image-studio-feature-clip-progress__step-bullet" aria-hidden />
						<span className="image-studio-feature-clip-progress__step-label">{ step.label }</span>
					</li>
				) ) }
			</ol>
			<div className="image-studio-feature-clip-progress__actions">
				<Button variant="secondary" __next40pxDefaultSize onClick={ handleOpenStudio }>
					{ __( 'Open studio', __i18n_text_domain__ ) }
				</Button>
				<Button
					variant="tertiary"
					__next40pxDefaultSize
					onClick={ handleCancel }
					disabled={ isCancelling }
				>
					{ isCancelling
						? __( 'Cancelling…', __i18n_text_domain__ )
						: __( 'Cancel', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
}
