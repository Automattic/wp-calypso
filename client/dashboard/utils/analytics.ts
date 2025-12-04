import { useAnalytics } from '../app/analytics';
import { useAppContext } from '../app/context';

/**
 * Hook that wraps useAnalytics and automatically adds msd_app_name property
 * to all tracked events. This allows differentiation between dashboard and
 * other app analytics.
 *
 * @returns Analytics client with recordTracksEvent and recordPageView methods
 */
export function useDashboardAnalytics() {
	const { recordTracksEvent, recordPageView } = useAnalytics();
	const { name } = useAppContext();

	const recordDashboardTracksEvent = (
		eventName: string,
		properties?: Record< string, unknown >
	) => {
		recordTracksEvent( eventName, {
			...properties,
			msd_app_name: name,
		} );
	};

	return {
		recordTracksEvent: recordDashboardTracksEvent,
		recordPageView,
	};
}
