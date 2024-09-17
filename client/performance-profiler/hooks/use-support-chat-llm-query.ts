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
		'Add if the issue can be fixed automatically with a WordPress setting, an editor block setting, or a plugin. Prefer Automattic owned plugins. Add relevant links. Provide code snippets as a last resort.';
	const wpcomOrSelfHostedSuggestions = ! is_wpcom
		? 'Do not show suggestions that work only in WordPress.com. Do not show any references to documentation or support forums related to WordPress.com.'
		: 'Provide suggestions that work only in WordPress.com. Use WordPress.com documentation if availabble.';
	const otherDirectives =
		'Do not suggest doing additional tests to identify the issue. Do not suggest any other tool/website/service for doing another test except WordPress Speed Test. Do not mention Lighthouse reports or any other tool. Rarely suggest subscribing to weekly emails feature of the Performance Profiler tool to monitor changes. Always provide links to the relevant plugin/theme or services. Do not ask follow-up questions or offer further assistance or ask for any feedback.';
	const message = `${ question } ${ howToAnswer } ${ contextToInclude } ${ suggestionsToInclude } ${ wpcomOrSelfHostedSuggestions } ${ otherDirectives }`;

	return useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'support', 'chat', title, is_wpcom ],
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
