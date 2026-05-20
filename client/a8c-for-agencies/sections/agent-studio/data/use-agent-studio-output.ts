import useAgentStudioOutputs from './use-agent-studio-outputs';

/**
 * Returns the single deliverable matching `outputId` from the cached
 * outputs list, plus a loading flag.
 *
 * The flat outputs endpoint is the source of truth for card metadata
 * (title, status, agent, kind). Drilling into a single deliverable
 * needs more (collateral + variants + variant HTML), but those come
 * from separate hooks (`useAgentStudioRun`, `useAgentStudioCollateral`,
 * `useAgentStudioVariantHtml`). This hook just gives the page its
 * top-of-page metadata without needing a dedicated single-output GET.
 */
export default function useAgentStudioOutput( outputId: string ) {
	const query = useAgentStudioOutputs();
	const output = query.data?.find( ( candidate ) => candidate.id === outputId );

	return {
		data: output,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
