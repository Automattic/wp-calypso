import { useDispatch, useSelect } from '@wordpress/data';
import { FLOATING_RIGHT_CORNER_SEED } from '../../constants';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { useIsResponsiveUndocked } from '../use-agent-layout-manager/responsive-undock-context';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Position/size wiring for a floating `AgentUI.Container`: mount-time seeds
 * and their change handlers, backed by the Agents Manager store. On the
 * responsive undock the panel opens at the right corner (where the sidebar
 * was) at the default size; a drag or resize made while undocked takes back
 * over. Otherwise the persisted values are restored.
 */
export default function useFloatingPanelProps() {
	const { setFloatingPosition, setFreeDragPosition, setFloatingSize } =
		useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition, freeDragPosition, floatingSize } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const isResponsiveUndocked = useIsResponsiveUndocked();

	// The responsive-undock transition clears the session values (see
	// `AgentDock`), so one being set means the user repositioned since —
	// keep it across remounts (route changes, close/reopen).
	const seedRightCorner = isResponsiveUndocked && ! freeDragPosition;

	return {
		initialChatPosition: seedRightCorner ? 'right' : floatingPosition,
		onChatPositionChange: setFloatingPosition,
		initialFreeDragPosition: seedRightCorner
			? FLOATING_RIGHT_CORNER_SEED
			: freeDragPosition ?? undefined,
		onFreeDragEnd: setFreeDragPosition,
		defaultSize: floatingSize ?? undefined,
		onResizeEnd: setFloatingSize,
	};
}
