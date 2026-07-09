import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, copy } from '@wordpress/icons';
import clsx from 'clsx';
import { Fragment, useCallback, useState } from 'react';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { CollapsibleCard } from '../../../components/collapsible-card';
import type { RecordTracksEvent } from './types';

import './style.scss';

export interface StarterPrompt {
	id: string;
	title: string;
	description: string;
	prompt: string;
}

export const STARTER_PROMPTS: StarterPrompt[] = [
	{
		id: 'program-health-snapshot',
		title: __( 'Program health snapshot' ),
		description: __(
			'Get a high-level read on your account, covering your tier and what it takes to level up, earnings and eligibility across all streams, and billing status, with the top action items surfaced first.'
		),
		prompt: __(
			'Give me a high-level health check of my Automattic for Agencies account. Cover three areas: (1) **Agency & tier** — my current tier, influenced revenue, and the gap to the next tier plus what’s required to get there; (2) **Earnings & eligibility** — lifetime earnings across referrals, WooPayments, and migrations, upcoming payouts, and flag any unresolved or unattributed referrals I could be leaving on the table; (3) **Billing** — current and previous month charges, payment method, and any upcoming renewals at risk of lapsing. Summarize with the most important action items up top.'
		),
	},
	{
		id: 'portfolio-health-summary',
		title: __( 'Portfolio health summary' ),
		description: __(
			'Scan every site you manage and get a grouped list of issues, including active threats, disconnected sites, vulnerable plugins, monitors down, and pending updates, so you know what to fix first.'
		),
		prompt: __(
			'Scan all the sites I manage in Automattic for Agencies and give me a succinct list of issues across the portfolio. Group by issue type — active threats, disconnected sites, vulnerable plugins, monitors down, and pending plugin updates — and list the affected sites under each. Start with a one-line count of healthy vs. unhealthy sites, and tell me which issues to fix first.'
		),
	},
	{
		id: 'recurring-weekly-report',
		title: __( 'Recurring weekly report' ),
		description: __(
			'Schedule an automatic weekly rundown of your entire account, including priorities, earnings, tier progress, site health, and billing, delivered where you want it every Monday morning.'
		),
		prompt: __(
			'Every Monday at 9:00 AM, generate a full weekly report on my Automattic for Agencies account and deliver it to me. Include an executive summary with top priorities, then sections for: earnings & eligibility (lifetime paid, upcoming payouts, unresolved referrals, migration incentive status), agency tier and progress, portfolio health (healthy vs. unhealthy site counts with issues grouped by type), and renewals & billing. Lead with anything urgent — active security threats or anything at risk of lapsing. Keep it skimmable with clear sections. Ask me where I’d like it delivered — Slack, email, or a saved document — before scheduling.'
		),
	},
];

function StarterPromptItem( {
	prompt,
	disabled,
	onCopy,
}: {
	prompt: StarterPrompt;
	disabled?: boolean;
	onCopy: ( prompt: StarterPrompt ) => void;
} ) {
	const [ copied, setCopied ] = useState( false );

	const handleCopy = useCallback( async () => {
		try {
			await navigator.clipboard.writeText( prompt.prompt );
			onCopy( prompt );
			setCopied( true );
			setTimeout( () => setCopied( false ), 2000 );
		} catch {
			// If the clipboard write fails, stay silent — the user can select the
			// prompt manually from the text below.
		}
	}, [ prompt, onCopy ] );

	return (
		<CollapsibleCard
			isBorderless
			disabled={ disabled }
			toggleLabel={ prompt.title }
			header={
				<Text weight={ 600 } size={ 15 }>
					{ prompt.title }
				</Text>
			}
		>
			<VStack spacing={ 3 }>
				<Text variant="muted">{ prompt.description }</Text>
				<div className="mcp-starter-prompt">
					<HStack justify="flex-end" className="mcp-starter-prompt__toolbar">
						<Button
							variant="tertiary"
							icon={ copied ? check : copy }
							label={ copied ? __( 'Copied' ) : __( 'Copy prompt' ) }
							showTooltip
							onClick={ handleCopy }
						/>
					</HStack>
					<Text className="mcp-starter-prompt__text">{ prompt.prompt }</Text>
				</div>
			</VStack>
		</CollapsibleCard>
	);
}

export default function McpStarterPrompts( {
	recordTracksEvent = () => {},
	disabled = false,
}: {
	recordTracksEvent?: RecordTracksEvent;
	disabled?: boolean;
} ) {
	const onCopy = useCallback(
		( prompt: StarterPrompt ) => {
			recordTracksEvent( 'calypso_a4a_ai_mcp_starter_prompt_copied', { prompt_id: prompt.id } );
		},
		[ recordTracksEvent ]
	);

	return (
		<Card>
			<CardBody>
				<VStack
					spacing={ 2 }
					className={ clsx( 'mcp-starter-prompts__intro', { 'is-disabled': disabled } ) }
				>
					<Text weight={ 600 } size={ 15 }>
						{ __( 'Starter prompts' ) }
					</Text>
					<Text variant="muted">
						{ __(
							'The sky’s the limit with AI agents. To help you get the most out of our MCP, we’ve created a set of starter prompts you can hand straight to the AI agent of your choice once connected. Feel free to modify them as you see fit for the best experience, tailored to your agency.'
						) }
					</Text>
				</VStack>
			</CardBody>
			{ STARTER_PROMPTS.map( ( prompt ) => (
				<Fragment key={ prompt.id }>
					<CardDivider style={ { borderColor: 'var(--color-border-subtle)' } } />
					<StarterPromptItem prompt={ prompt } disabled={ disabled } onCopy={ onCopy } />
				</Fragment>
			) ) }
		</Card>
	);
}
