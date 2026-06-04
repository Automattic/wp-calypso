/* eslint-disable no-restricted-imports */
import { useAiSurfaceCoexistence } from './use-unified-ai-chat';

export const useShouldCoexistAiSurfaces = () => {
	const { data } = useAiSurfaceCoexistence();
	return !! data || true; // TEMP: force-on for local validation (revert me)
};
