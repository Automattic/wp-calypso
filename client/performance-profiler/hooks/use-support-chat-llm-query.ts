import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

function mapResult( response: WPComSupportQueryResponse ) {
	return response.messages?.[ 0 ]?.content ?? '';
}

export const useSupportChatLLMQuery = (
	title: string,
	context: string,
	hash: string,
	is_wpcom: boolean,
	enable: boolean
) => {
	const question = `I need to fix the following issue to improve the performance of my WordPress site: ${ title }.`;
	const howToAnswer =
		'Answer me in two topics in bold: "Why is this important?" and "How to fix this?".';
	const contextToInclude = `Use each of the following context: ${ context }. Visit any links provided for more information.`;
	const suggestionsToInclude =
		'Add if the issue can be fixed automatically with a WordPress setting, an editor block setting, or a plugin. Prefer Automattic owned plugins. Add relevant links.';
	const message = `${ question } ${ howToAnswer } ${ contextToInclude } ${ suggestionsToInclude }`;

	return useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'support', 'chat', context, is_wpcom ],
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
		enabled: !! context && enable,
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
