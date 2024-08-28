import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

function mapResult( response: WPComSupportQueryResponse ) {
	return response.messages?.[ 0 ]?.content ?? '';
}

export const useSupportChatLLMQuery = ( description: string, enable: boolean ) => {
	const question = `I need to fix the following issue to improve the performance of site: ${ description }.`;
	const howToAnswer =
		'Answer me in two topics in bold: "Why is this important?" and "How to fix this?"';
	const message = `${ question } ${ howToAnswer }`;

	return useQuery( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'support', 'chat', description ],
		queryFn: () =>
			wp.req.post(
				{
					path: '/odie/chat/wpcom-support-chat/',
					apiNamespace: 'wpcom/v2',
				},
				{ message }
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
