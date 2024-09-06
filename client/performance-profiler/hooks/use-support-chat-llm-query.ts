import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

function mapResult( response: WPComSupportQueryResponse ) {
	return response.messages?.[ 0 ]?.content ?? '';
}

export const useSupportChatLLMQuery = (
	description: string,
	hash: string,
	is_wpcom: boolean,
	enable: boolean
) => {
	const question = `I need to fix the following issue to improve the performance of site: ${ description }.`;
	const howToAnswer =
		'Answer me in two topics in bold: "Why is this important?" and "How to fix this?"';
	const message = `${ question } ${ howToAnswer }`;

	return useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'support', 'chat', description, is_wpcom ],
		queryFn: () =>
			wp.req.post(
				{
					path: `/odie/assistant/performance-profiler?hash=${ hash }`,
					apiNamespace: 'wpcom/v2',
				},
				{ message, is_wpcom }
			),
		meta: {
			persist: false,
		},
		select: mapResult,
		enabled: !! description && enable,
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
