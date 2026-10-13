/**
 * PROTOTYPE — proof of concept only.
 *
 * Step labels over a single, continuous progress meter for `/custom-signup`.
 * The fill reaches the middle of the current step's column, so moving to the
 * next step animates one bar forward.
 */
import clsx from 'clsx';

type Props = {
	labels: string[];
	// 1-based index of the current step.
	currentStep: number;
};

export default function StepProgress( { labels, currentStep }: Props ) {
	const percent = ( ( currentStep - 0.5 ) / labels.length ) * 100;

	return (
		<div className="a4a-custom-signup-progress">
			<ol
				className="a4a-custom-signup-progress-labels"
				style={ { gridTemplateColumns: `repeat( ${ labels.length }, 1fr )` } }
			>
				{ labels.map( ( label, index ) => (
					<li
						key={ label }
						className={ clsx( 'a4a-custom-signup-progress-label', {
							'is-active': index + 1 <= currentStep,
						} ) }
						aria-current={ index + 1 === currentStep ? 'step' : undefined }
					>
						{ label }
					</li>
				) ) }
			</ol>
			<div
				className="a4a-custom-signup-progress-track"
				role="progressbar"
				aria-valuemin={ 1 }
				aria-valuemax={ labels.length }
				aria-valuenow={ currentStep }
			>
				<span className="a4a-custom-signup-progress-fill" style={ { width: `${ percent }%` } } />
			</div>
		</div>
	);
}
