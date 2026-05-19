import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Mode = 'human' | 'ai';

type Severity = 'good' | 'warn' | 'danger';

type Prompt = {
	label: string;
	severity: Severity;
	body: string;
};

type ModeData = {
	issueCount: string;
	prompts: Prompt[];
};

function PromptItem( { label, severity, body }: Prompt ) {
	return (
		<div className="amplify-landing-workflow-prompt-item">
			<div className="amplify-landing-workflow-prompt-item-content">
				<span className="amplify-landing-workflow-prompt-item-label">
					<span
						className={ clsx( 'amplify-landing-workflow-prompt-item-dot', severity ) }
						aria-hidden="true"
					/>
					{ label }
				</span>
				<div className="amplify-landing-workflow-prompt-text">{ body }</div>
			</div>
			<button type="button" className="amplify-landing-workflow-prompt-copy">
				{ __( 'Copy' ) }
			</button>
		</div>
	);
}

// Hoisted to module scope — static data, no reason to reallocate on every render.
// Each prompt corresponds to one of the pins shown in the See-it-in-action demo
// above (amplify-how-it-works.tsx) so the narrative across the two sections
// stays consistent: the demo flags the issues, this card shows the prompts
// that would be generated to fix them. Labels mirror the pin labels (short
// form) and bodies are succinct, agent-ready instructions referencing the
// Crestline Studio mock content.
const MODES: Record< Mode, ModeData > = {
	human: {
		issueCount: __( '4 issues found' ),
		prompts: [
			{
				label: __( 'Hero headline' ),
				severity: 'warn',
				body: __(
					'Rewrite the H1 "We build brands that win online" into a value-specific headline that names who Crestline serves and the outcome delivered.'
				),
			},
			{
				label: __( 'Client logos' ),
				severity: 'danger',
				body: __(
					'Add a client logos section above the fold with a heading that frames the logos as social proof rather than a list of names.'
				),
			},
			{
				label: __( 'CTA copy' ),
				severity: 'warn',
				body: __(
					'Replace the "Get in touch" hero button with a specific, action-oriented label such as "Book a discovery call" or "Start your project."'
				),
			},
			{
				label: __( 'Testimonials' ),
				severity: 'danger',
				body: __(
					'Add a testimonials block above the fold using the Jetpack Reviews block. Prioritize quotes with named clients, photos, and measurable outcomes.'
				),
			},
		],
	},
	ai: {
		issueCount: __( '4 issues found' ),
		prompts: [
			{
				label: __( 'Organization schema' ),
				severity: 'danger',
				body: __(
					'Generate JSON-LD Organization schema for Crestline Studio with name, URL, logo, sameAs social profiles, and a one-sentence description.'
				),
			},
			{
				label: __( 'Service detail' ),
				severity: 'warn',
				body: __(
					'Expand each service block with named deliverables, target client types, and one quantified outcome so AI tools have specifics to cite.'
				),
			},
			{
				label: __( 'FAQ schema' ),
				severity: 'danger',
				body: __(
					'Add an FAQ section with five common prospect questions and apply FAQPage JSON-LD so AI tools can extract Q&A pairs verbatim.'
				),
			},
			{
				label: __( 'GPTBot access' ),
				severity: 'danger',
				body: __(
					'Update robots.txt to explicitly allow the GPTBot, ClaudeBot, and anthropic-ai user agents, then verify the homepage is reachable by each.'
				),
			},
		],
	},
};

export default function AmplifyAiWorkflow() {
	const dispatch = useDispatch();
	const [ mode, setMode ] = useState< Mode >( 'human' );

	const handleModeChange = ( nextMode: Mode ) => {
		if ( nextMode === mode ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_mode_toggle', {
				mode: nextMode,
				surface: 'workflow',
			} )
		);
		setMode( nextMode );
	};

	const data = MODES[ mode ];

	return (
		<PageSectionColumns className="amplify-landing-workflow">
			<PageSectionColumns.Column>
				{ /*
					Wrap so PageSectionColumns' 32px column gap doesn't stack on top
					of each element's margin-block-end. With the wrapper, eyebrow →
					title → body spacing is governed by the per-element margins,
					matching the criteria-section rhythm.
				*/ }
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
			</PageSectionColumns.Column>

			<PageSectionColumns.Column>
				<div className="amplify-landing-workflow-card">
					<div className="amplify-landing-workflow-card-header">
						<div className="amplify-landing-workflow-card-header-left">
							<span className="amplify-landing-workflow-card-title">
								{ __( 'Generated prompts' ) }
							</span>
							<span className="amplify-landing-workflow-card-count">{ data.issueCount }</span>
						</div>
						<div
							className="amplify-landing-workflow-mode-toggle"
							role="tablist"
							aria-label={ __( 'Analysis mode' ) }
						>
							<Button
								role="tab"
								aria-selected={ mode === 'human' }
								className={ clsx( 'amplify-landing-workflow-mode-btn', {
									'is-active': mode === 'human',
								} ) }
								onClick={ () => handleModeChange( 'human' ) }
							>
								{ __( 'Human' ) }
							</Button>
							<Button
								role="tab"
								aria-selected={ mode === 'ai' }
								className={ clsx( 'amplify-landing-workflow-mode-btn', {
									'is-active': mode === 'ai',
								} ) }
								onClick={ () => handleModeChange( 'ai' ) }
							>
								{ __( 'AI' ) }
							</Button>
						</div>
					</div>
					<div className="amplify-landing-workflow-prompt-items">
						{ data.prompts.map( ( prompt ) => (
							<PromptItem key={ prompt.label } { ...prompt } />
						) ) }
					</div>
					<div className="amplify-landing-workflow-card-footer">
						<button type="button" className="amplify-landing-workflow-copy-all">
							{ __( 'Copy all prompts' ) }
						</button>
					</div>
				</div>
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
