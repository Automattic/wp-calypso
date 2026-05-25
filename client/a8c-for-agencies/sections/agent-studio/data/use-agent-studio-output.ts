import useAgentStudioOutputs from './use-agent-studio-outputs';

export default function useAgentStudioOutput( outputId: string ) {
	const query = useAgentStudioOutputs();
	const output = query.data?.find( ( candidate ) => candidate.id === outputId );

	return {
		data: output,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
