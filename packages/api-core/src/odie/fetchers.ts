import { wpcom } from '../wpcom-fetcher';
import type { PerformanceMetricAudit } from '../site-performance';

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
			path: '/site-profiler/assistant',
			apiNamespace: 'wpcom/v2',
		},
		{
			hash,
		},
		{
			insight,
			is_wpcom: isWpcom,
			locale,
			device_strategy: device,
		}
	);

	return {
		messages: response.content ?? '',
		chatId: response.chat_id,
	};
}
