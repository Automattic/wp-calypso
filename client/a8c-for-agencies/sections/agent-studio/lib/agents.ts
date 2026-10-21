import { __ } from '@wordpress/i18n';
import { Icon, image, layout, page } from '@wordpress/icons';
import { useMemo } from 'react';
import eventAssetsPreview from '../assets/agent-previews/event-assets.webp';
import onePagerPreview from '../assets/agent-previews/one-pager.webp';
import socialAssetsPreview from '../assets/agent-previews/social-assets.webp';

export type AgentStudioAgentId = 'social-assets' | 'one-pager' | 'event-assets';

export interface AgentStudioAgent {
	id: AgentStudioAgentId;
	/** The agent's first name, shown on the picker tile and in the brief. */
	name: string;
	/** The agent's role, e.g. "Social media asset designer". */
	role: string;
	/** A short line about when to reach for this agent. */
	description: string;
	/** Label stored on the deliverables the agent produces. */
	deliverableType: string;
	/** The lines the agent opens the brief with, each rendered as its own line. */
	greeting: string[];
	/** Icon shown on the picker tile when no preview image is set. */
	icon: React.ComponentProps< typeof Icon >[ 'icon' ];
	/** Preview image of the agent's output, shown on the picker tile. */
	previewImage?: string;
	/** Agents that are announced but not yet briefable. */
	disabled?: boolean;
}

export function useAgentStudioAgents(): AgentStudioAgent[] {
	return useMemo(
		() => [
			{
				id: 'one-pager',
				name: __( 'June' ),
				role: __( 'Sales collateral designer' ),
				description: __( 'When you need a polished PDF leave-behind.' ),
				deliverableType: __( 'PDF' ),
				greeting: [
					__(
						'Hi, I’m June. Paste in your written content and I’ll design it into a polished PDF.'
					),
					__( 'Add images and I’ll lay them out for you.' ),
				],
				icon: page,
				previewImage: onePagerPreview,
			},
			{
				id: 'social-assets',
				name: __( 'Iris' ),
				role: __( 'Social media asset designer' ),
				description: __( 'When you’re publishing on social and need clean, consistent design.' ),
				deliverableType: __( 'Social assets' ),
				greeting: [
					__(
						'Hi, I’m Iris. Drop in a headline, an optional stat, and any visuals you have, and I’ll design a cover plus every social size.'
					),
					__( 'Add an image if you have one.' ),
				],
				icon: image,
				previewImage: socialAssetsPreview,
			},
			{
				id: 'event-assets',
				name: __( 'Remy' ),
				role: __( 'Event asset designer' ),
				description: __( 'When you’re promoting an event and need every asset on brand.' ),
				deliverableType: __( 'Event assets' ),
				greeting: [
					__(
						'Hi, I’m Remy. Tell me about the event — the name, the date, the pitch. I’ll design a set of promo assets you can share everywhere.'
					),
				],
				icon: layout,
				previewImage: eventAssetsPreview,
				disabled: true,
			},
		],
		[]
	);
}

export function useAgentStudioAgent( agentId?: string ): AgentStudioAgent | undefined {
	const agents = useAgentStudioAgents();
	return agents.find( ( agent ) => agent.id === agentId );
}
