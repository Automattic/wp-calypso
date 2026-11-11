import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { backup, globe, lock, people } from '@wordpress/icons';
import { useHelpCenter } from '../../../app/help-center';
import { useScheduleCall } from '../../tiers/use-schedule-call';
import { FeatureList, HelpRow, Questions } from './step-kit';
import type { Host } from './use-site-wizard';

/** Opens a support chat that already says what the agency was doing. */
export function SupportHelp( {
	title,
	description,
	chatMessage,
}: {
	title: string;
	description: string;
	chatMessage: string;
} ) {
	const { setNewMessagingChat } = useHelpCenter();
	return (
		<HelpRow
			title={ title }
			description={ description }
			action={ __( 'Chat with support' ) }
			onAction={ () => setNewMessagingChat( { initialMessage: chatMessage } ) }
		/>
	);
}

/** Books time with the agency's partner team, for moves that need planning. */
export function CallHelp( { title, description }: { title: string; description: string } ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { scheduleCall } = useScheduleCall( agency?.id );
	return (
		<HelpRow
			title={ title }
			description={ description }
			action={ __( 'Schedule a call' ) }
			onAction={ () => scheduleCall() }
		/>
	);
}

export function MoveQuestions() {
	return (
		<Questions
			title={ __( 'FAQ' ) }
			items={ [
				{
					question: __( 'Does moving cost anything?' ),
					answer: __(
						'No. Moving is free whether our team does it or you do. You only pay for hosting.'
					),
				},
				{
					question: __( 'How long does it take?' ),
					answer: __(
						'Most migrations happen within one working week of your request. Large batches move in groups, on a schedule you agree to.'
					),
				},
				{
					question: __( 'Will my sites go down?' ),
					answer: __(
						'No. Each site is copied while the original stays live. The domain switches only after you approve the copy. For stores, we pick a quiet window together.'
					),
				},
				{
					question: __( 'What do I need to do?' ),
					answer: __(
						'If our team moves your sites, you share a login for each one through a secure link, then review each copy. If you move them yourself, a guide walks you through each site.'
					),
				},
				{
					question: __( 'Do I earn anything for moving sites?' ),
					answer: __(
						'Yes. Each site earns a migration commission after six months on its new hosting.'
					),
				},
			] }
		/>
	);
}

export function CreateQuestions() {
	return (
		<Questions
			title={ __( 'FAQ' ) }
			items={ [
				{
					question: __( 'What’s a development site?' ),
					answer: __(
						'A WordPress.com site to build and share with your client before launch. Your agency can run five at once, free.'
					),
				},
				{
					question: __( 'When do I pay?' ),
					answer: __(
						'Development sites are free until launch. Production sites need a hosting plan from the start, paid by your agency or your client.'
					),
				},
				{
					question: __( 'Can I use my client’s domain?' ),
					answer: __(
						'Yes. Every site starts on a temporary address. Connect your client’s domain when you launch.'
					),
				},
				{
					question: __( 'Can a development site become a production site?' ),
					answer: __(
						'Yes. Add a hosting plan when you’re ready, and the same site goes live. Nothing is rebuilt.'
					),
				},
			] }
		/>
	);
}

/** What moved sites get on their new hosting. */
export function HostingFeatures( { host }: { host: Host } ) {
	return (
		<FeatureList
			items={ [
				{
					icon: backup,
					title: __( 'Daily backups' ),
					description: __( 'Restore any site in one click.' ),
				},
				{
					icon: lock,
					title: __( 'Security and updates' ),
					description: __( 'Handled for you, around the clock.' ),
				},
				{
					icon: globe,
					title: __( 'Staging sites' ),
					description: __( 'Test changes before they go live.' ),
				},
				{
					icon: people,
					title: host === 'pressable' ? __( '24/7 WordPress experts' ) : __( 'Expert support' ),
					description: __( 'Real people, whenever you need help.' ),
				},
			] }
		/>
	);
}
