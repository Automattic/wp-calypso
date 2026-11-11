import { useDispatch, useSelect } from '@wordpress/data';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { useResponsiveUndock } from '../use-agent-layout-manager/responsive-undock-context';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Position and size props for a floating `AgentUI.Container`, backed by the
 * Agents Manager store. On each responsive undock, the layout command moves the
 * panel to the right corner (where the sidebar was) at the default size;
 * `agenttic-ui` reports the move through the same change handlers, so the side
 * is saved and the panel reopens where the user last saw it.
 */
export default function useFloatingPanelProps() {
	const { setFloatingPosition, setFreeDragPosition, setFloatingSize } =
		useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition, freeDragPosition, floatingSize } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { isResponsiveUndocked, undockCount } = useResponsiveUndock();

	return {
		// A panel mounting while already responsive-undocked (page load or chat
		// reopen on a narrow viewport) gets no command, so seed the side here.
		initialChatPosition: isResponsiveUndocked ? ( 'right' as const ) : floatingPosition,
		onChatPositionChange: setFloatingPosition,
		initialFreeDragPosition: freeDragPosition ?? undefined,
		onFreeDragEnd: setFreeDragPosition,
		defaultSize: floatingSize ?? undefined,
		onResizeEnd: setFloatingSize,
		layoutCommand: { id: undockCount, side: 'right' as const, resetSize: true },
	};
}
