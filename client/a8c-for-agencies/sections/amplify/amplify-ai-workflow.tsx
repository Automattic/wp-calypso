import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

type Severity = 'good' | 'warn' | 'danger';

type Prompt = {
	label: string;
	severity: Severity;
	body: string;
};

function PromptItem( { label, severity, body }: Prompt ) {
	return (
		<div className="amplify-landing-workflow-prompt-item">
			<div className="amplify-landing-workflow-prompt-item-header">
				<span className="amplify-landing-workflow-prompt-item-label">
					<span
						className={ clsx( 'amplify-landing-workflow-prompt-item-dot', severity ) }
						aria-hidden="true"
					/>
					{ label }
				</span>
				<button type="button" className="amplify-landing-workflow-prompt-copy">
					{ __( 'Copy' ) }
				</button>
			</div>
			<div className="amplify-landing-workflow-prompt-text">{ body }</div>
		</div>
	);
}

// Hoisted to module scope — static data, no reason to reallocate on every render.
const PROMPTS: Prompt[] = [
	{
		label: __( 'Service clarity' ),
		severity: 'danger',
		body: __(
			'Rewrite the services section of this WordPress page to clearly articulate the specific outcomes each service delivers. Replace generic descriptions with client-focused language that answers “what will this do for my business?”'
		),
	},
	{
		label: __( 'Trust signals' ),
		severity: 'danger',
		body: __(
			'Add a testimonials block above the fold on the homepage using the Jetpack Reviews block. Pull from existing client testimonials and prioritise quotes that reference measurable outcomes or specific project types.'
		),
	},
	{
		label: __( 'CTA optimization' ),
		severity: 'warn',
		body: __(
			'Update the primary hero button text from “Learn more” to a specific, action-oriented phrase that communicates value. Suggested: “See how we work” or “Start your project.” Ensure it links to the contact or work page.'
		),
	},
	{
		label: __( 'Visual hierarchy' ),
		severity: 'warn',
		body: __(
			'Audit the heading structure across the homepage. Ensure there is a single H1, that H2s clearly segment each section, and that no decorative text is marked as a heading element. Fix any heading tags used purely for styling.'
		),
	},
];

export default function AmplifyAiWorkflow() {
	return (
		<div className="amplify-landing-workflow">
			<div className="amplify-landing-workflow-top">
				<div className="amplify-landing-workflow-text">
					<p className="amplify-landing-workflow-eyebrow">{ __( 'AI workflow integration' ) }</p>
					<h2 className="amplify-landing-workflow-title">
						{ createInterpolateElement( __( 'Audit to agent<br />in seconds' ), {
							br: <br />,
						} ) }
					</h2>
					<p className="amplify-landing-workflow-body">
						{ __(
							'Amplify generates a precise, agent-ready prompt for every issue it finds. Send any or all of them to your AI tool of choice: Claude, Codex, Gemini, whatever fits your workflow. Then, through WordPress Studio, those changes can be applied at lightning speed directly to your sites in staging or production.'
						) }
					</p>
				</div>

				<div className="amplify-landing-workflow-card">
					<div className="amplify-landing-workflow-card-header">
						<div className="amplify-landing-workflow-card-header-left">
							<span className="amplify-landing-workflow-card-title">
								{ __( 'Generated prompts' ) }
							</span>
							<span className="amplify-landing-workflow-card-mode">
								{ __( 'Human-centric analysis' ) }
							</span>
						</div>
						<span className="amplify-landing-workflow-card-count">{ __( '4 issues found' ) }</span>
					</div>
					<div className="amplify-landing-workflow-prompt-items">
						{ PROMPTS.map( ( prompt ) => (
							<PromptItem key={ prompt.label } { ...prompt } />
						) ) }
					</div>
					<div className="amplify-landing-workflow-card-footer">
						<span className="amplify-landing-workflow-studio-label">
							<span className="amplify-landing-workflow-studio-dot" aria-hidden="true" />
							{ __( 'WordPress Studio connected' ) }
						</span>
						<button type="button" className="amplify-landing-workflow-send-btn">
							{ __( 'Send all to Claude' ) }
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M5 12h14" />
								<path d="m12 5 7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
