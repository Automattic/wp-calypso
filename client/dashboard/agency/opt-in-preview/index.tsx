/**
 * Development-only floating panel that swaps the states of the dashboard
 * opt-in flow. The panel itself (`floating-panel.tsx`, `dev-state-controls.scss`,
 * `style.scss`) is copied from the design preview on `try/a4a-sites-migrations`.
 */
import { ToggleControl } from '@wordpress/components';
import FloatingPreviewPanel, { usePreviewPanelSettings } from './floating-panel';
import {
	OPT_IN_STEPS,
	currentStepId,
	goToStep,
	isOptInPreviewEnabled,
	setOptInPreview,
	useOptInPreview,
} from './store';
import type { PreviewAgency, PreviewRole } from './store';
import './style.scss';

export * from './store';

const ROLE_LABELS: Record< PreviewRole, string > = {
	owner: 'Owner',
	member: 'Team member',
};

const AGENCY_LABELS: Record< PreviewAgency, string > = {
	'not-opted-in': 'Not opted in',
	'opted-in': 'Opted in',
	new: 'New agency',
};

export default function OptInPreviewPanel() {
	const state = useOptInPreview();
	const [ settings, setSettings, ready ] = usePreviewPanelSettings( isOptInPreviewEnabled );

	if ( ! state || ! ready ) {
		return null;
	}

	const activeStep = currentStepId( state );

	return (
		<FloatingPreviewPanel
			title="Opt-in preview"
			settings={ settings }
			onChange={ setSettings }
			onRestart={ () => goToStep( OPT_IN_STEPS[ 0 ], state.role ) }
		>
			<fieldset>
				<legend>Viewing as</legend>
				<div className="dashboard-amplify-dev-controls__choices">
					{ ( Object.keys( ROLE_LABELS ) as PreviewRole[] ).map( ( role ) => (
						<label key={ role }>
							<input
								type="radio"
								name="opt-in-preview-role"
								checked={ state.role === role }
								onChange={ () => setOptInPreview( { role } ) }
							/>
							{ ROLE_LABELS[ role ] }
						</label>
					) ) }
				</div>
			</fieldset>
			<fieldset>
				<legend>Agency</legend>
				<div className="dashboard-amplify-dev-controls__choices">
					{ ( Object.keys( AGENCY_LABELS ) as PreviewAgency[] ).map( ( agency ) => (
						<label key={ agency }>
							<input
								type="radio"
								name="opt-in-preview-agency"
								checked={ state.agency === agency }
								onChange={ () => setOptInPreview( { agency, overlay: null } ) }
							/>
							{ AGENCY_LABELS[ agency ] }
						</label>
					) ) }
				</div>
			</fieldset>
			<fieldset>
				<ToggleControl
					__nextHasNoMarginBottom
					label="First visit"
					checked={ state.firstVisit }
					onChange={ ( firstVisit ) => setOptInPreview( { firstVisit, overlay: null } ) }
				/>
			</fieldset>
			<nav className="agency-design-preview-panel__flows" aria-label="Jump to a step">
				<strong>Jump to step</strong>
				<ul>
					{ OPT_IN_STEPS.map( ( step, index ) => (
						<li key={ step.id }>
							<button
								type="button"
								aria-current={ activeStep === step.id ? 'step' : undefined }
								onClick={ () => goToStep( step, state.role ) }
							>
								{ `${ index + 1 }. ${ step.label }` }
							</button>
						</li>
					) ) }
				</ul>
			</nav>
		</FloatingPreviewPanel>
	);
}
