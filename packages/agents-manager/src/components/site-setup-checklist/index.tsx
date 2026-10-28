import { AgentUIChecklist, type ChecklistItem } from '@automattic/agenttic-ui';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import './style.scss';
import type { SiteSetupChecklistVariant } from '../../hooks/use-site-setup-checklist';

export interface SiteSetupChecklistProps {
	items: ChecklistItem[];
	/** In a new chat's empty view, open; pinned above the messages, folded. */
	variant: SiteSetupChecklistVariant;
	/** A turn is running: tasks look and act inert. */
	busy?: boolean;
	/** The pinned list takes the focus the list it replaced had. */
	focusHeaderOnMount?: boolean;
}

/**
 * The Site Setup checklist: in the empty view while the chat is new, pinned
 * above the messages once a task was picked. Rendered inside the chat
 * container either way, so a picked task goes through the suggestion submit
 * path. The pinned block unfolds on mount: it usually lands after the
 * conversation did, and would otherwise shove the messages down in one jump.
 */
export default function SiteSetupChecklist( {
	items,
	variant,
	busy = false,
	focusHeaderOnMount = false,
}: SiteSetupChecklistProps ) {
	const pinned = variant === 'pinned';
	const [ isEntered, setIsEntered ] = useState( false );

	useEffect( () => {
		if ( ! pinned ) {
			return;
		}
		// Next frame, so the collapsed state paints first and the transition runs.
		const frame = window.requestAnimationFrame( () => setIsEntered( true ) );
		return () => window.cancelAnimationFrame( frame );
	}, [ pinned ] );

	const checklist = (
		<AgentUIChecklist
			title={ __( 'Site Setup', __i18n_text_domain__ ) }
			items={ items }
			defaultCollapsed={ pinned }
			expandOnSettle
			busy={ busy }
			focusHeaderOnMount={ focusHeaderOnMount }
		/>
	);

	if ( ! pinned ) {
		return checklist;
	}

	return (
		<div
			className={ clsx( 'agents-manager-site-setup-checklist--pinned', {
				'is-entered': isEntered,
			} ) }
		>
			<div>{ checklist }</div>
		</div>
	);
}
