import { useQuery } from '@tanstack/react-query';
import { PerformanceMetricsItemQueryResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';

function mapResult( response: WPComSupportQueryResponse ) {
	return response.messages?.[ 0 ]?.content ?? '';
}

export const useSupportChatLLMQuery = (
	insight: PerformanceMetricsItemQueryResponse,
	hash: string,
	is_wpcom: boolean,
	enable: boolean
) => {
	return useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'support', 'chat', insight.title, is_wpcom ],
		queryFn: () =>
			wp.req.post(
				{
					path: `/odie/assistant/performance-profiler?hash=${ hash }`,
					apiNamespace: 'wpcom/v2',
				},
				{
					insight,
					is_wpcom,
				}
			),
		meta: {
			persist: false,
		},
		select: mapResult,
		enabled: !! insight.title && enable,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};

type WPComSupportQueryResponse = {
	messages: Array< WPComSupportMessageQueryResponse >;
};

type WPComSupportMessageQueryResponse = {
	content: string;
};
