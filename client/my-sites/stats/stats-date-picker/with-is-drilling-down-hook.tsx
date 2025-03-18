import { useMemo } from 'react';

interface WithIsDrillingDownHookProps {
	period: string;
	isDrillingDown: string | null;
}

// TODO: Refactor this to use the `useMemo` hook directly once the `StatsDatePicker` becomes a Functional Component.
/*
 * This HOC is used to pass the `isDrillingDown` prop to the `StatsDatePicker` component.
 * The `isDrillingDown` prop is used to determine if the date label should show a drill-up button.
 * Cache the removed session storage item `jetpack_stats_date_range_is_drilling_down`
 * to keep showing the drill-up action button when re-rendering by parent components until the chart period is changed.
 */
function withIsDrillingDownHook( Component: React.ComponentType< WithIsDrillingDownHookProps > ) {
	return function WrappedComponent( props: WithIsDrillingDownHookProps ) {
		const isDrillingDown = useMemo( () => {
			return sessionStorage.getItem( 'jetpack_stats_date_range_is_drilling_down' );
		}, [ props.period ] ); // eslint-disable-line react-hooks/exhaustive-deps

		return <Component { ...props } isDrillingDown={ isDrillingDown } />;
	};
}

export default withIsDrillingDownHook;
