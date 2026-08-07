import { useDispatch, useSelect } from '@wordpress/data';
import { FLOATING_RIGHT_CORNER_SEED } from '../../constants';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { useResponsiveUndock } from '../use-agent-layout-manager/responsive-undock-context';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * `key` and props for a floating `AgentUI.Container`: mount-time position/size
 * seeds and their change handlers, backed by the Agents Manager store. On a
 * responsive undock the panel opens at the right corner (where the sidebar
 * was) at the default size until the user drags or resizes it; otherwise the
 * persisted values are restored.
 */
export default function useFloatingPanelProps( isDocked: boolean ) {
	const { setFloatingPosition, setFreeDragPosition, setFloatingSize } =
		useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition, freeDragPosition, floatingSize } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { isResponsiveUndocked, undockCount } = useResponsiveUndock();

	// Each responsive undock clears the session values (see `AgentDock`), so a
	// set value means the user repositioned since the switch — keep it across
	// remounts (route changes, close/reopen).
	const seedRightCorner = isResponsiveUndocked && ! freeDragPosition;

	return {
		// Remount on dock/undock and on each responsive undock — the seed
		// props are read at mount only.
		containerKey: isDocked ? 'embedded' : `floating-${ undockCount }`,
		containerProps: {
			initialChatPosition: seedRightCorner ? 'right' : floatingPosition,
			onChatPositionChange: setFloatingPosition,
			initialFreeDragPosition: seedRightCorner
				? FLOATING_RIGHT_CORNER_SEED
				: freeDragPosition ?? undefined,
			onFreeDragEnd: setFreeDragPosition,
			defaultSize: floatingSize ?? undefined,
			onResizeEnd: setFloatingSize,
		},
	};
}
