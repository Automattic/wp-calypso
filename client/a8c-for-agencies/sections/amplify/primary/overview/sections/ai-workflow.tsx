import {
	Card,
	CardHeader,
	CardBody,
	CardDivider,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Fragment, useState } from 'react';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './ai-workflow.scss';

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
		<CardBody>
			<VStack spacing={ 2 }>
				<HStack spacing={ 2 } alignment="center" justify="flex-start">
					<span
						className={ clsx( 'amplify-landing-workflow-prompt-item-dot', severity ) }
						aria-hidden="true"
					/>
					<Text weight={ 600 } size={ 13 }>
						{ label }
					</Text>
				</HStack>
				<Text variant="muted" size={ 13 }>
					{ preventWidows( body ) }
				</Text>
			</VStack>
		</CardBody>
	);
}

// Hoisted to module scope — static data, no reason to reallocate on every render.
// Each prompt corresponds to one of the pins shown in the See-it-in-action demo
// above (how-it-works.tsx) so the narrative across the two sections
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
				<VStack spacing={ 4 }>
					<Text upperCase variant="muted" size={ 11 } weight={ 600 } letterSpacing="1px">
						{ __( 'AI workflow integration' ) }
					</Text>
					<Heading level={ 2 }>{ __( 'Audit to agent in seconds' ) }</Heading>
					<Text isBlock variant="muted" size={ 16 }>
						{ preventWidows(
							__(
								'Amplify generates a precise, agent-ready prompt for every issue it finds. Send any or all of them to your AI tool of choice: Claude, Codex, Gemini, whatever fits your workflow. Then, through WordPress Studio, those changes can be applied at lightning speed directly to your sites in staging or production.'
							)
						) }
					</Text>
				</VStack>
			</PageSectionColumns.Column>

			<PageSectionColumns.Column>
				<Card elevation={ 3 } className="amplify-landing-workflow-card">
					<CardHeader>
						<VStack spacing={ 1 }>
							<Text upperCase variant="muted" size={ 11 } weight={ 600 } letterSpacing="0.5px">
								{ __( 'Generated prompts' ) }
							</Text>
							<Text variant="muted" size={ 12 }>
								{ data.issueCount }
							</Text>
						</VStack>
						<ToggleGroupControl
							__next40pxDefaultSize
							isBlock
							hideLabelFromVision
							label={ __( 'Analysis mode' ) }
							value={ mode }
							onChange={ ( value ) => handleModeChange( value as Mode ) }
							className="amplify-landing-workflow-mode-toggle"
						>
							<ToggleGroupControlOption value="human" label={ __( 'Human' ) } />
							<ToggleGroupControlOption value="ai" label={ __( 'AI' ) } />
						</ToggleGroupControl>
					</CardHeader>
					{ data.prompts.map( ( prompt, index ) => (
						<Fragment key={ prompt.label }>
							{ index > 0 && <CardDivider /> }
							<PromptItem { ...prompt } />
						</Fragment>
					) ) }
				</Card>
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
