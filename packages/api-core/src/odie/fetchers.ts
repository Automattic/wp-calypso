import { wpcom } from '../wpcom-fetcher';
import type { PerformanceMetricAudit } from '../site-performance';

interface A2APart {
	type?: string;
	text?: string;
}

export async function fetchOdieAssistantPerformanceProfiler( {
	hash,
	insight,
	isWpcom,
	locale,
	device,
}: {
	hash: string;
	insight: PerformanceMetricAudit;
	isWpcom: boolean;
	locale?: string;
	device?: string;
} ) {
	const response = await wpcom.req.post(
		{
			path: '/ai/agent/performance-audits',
			apiNamespace: 'wpcom/v2',
		},
		{},
		{
			jsonrpc: '2.0',
			id: 1,
			method: 'message/send',
			params: {
				message: {
					role: 'user',
					parts: [
						{ type: 'text', text: 'Recommend a fix for this performance audit.' },
						{
							type: 'data',
							data: {
								clientContext: {
									constructorArguments: {
										hash,
										insight,
										is_wpcom: isWpcom,
										device_strategy: device,
										locale,
									},
								},
							},
						},
					],
				},
			},
		}
	);

	const parts: A2APart[] = response?.result?.status?.message?.parts ?? [];
	const textPart = parts.find( ( part ) => part.type === 'text' );

	return {
		messages: textPart?.text ?? '',
		// A2A returns a session UUID instead of a numeric chat id; it is logged as
		// chat_id on the rating Tracks events.
		chatId: response?.result?.sessionId ?? '',
	};
}
