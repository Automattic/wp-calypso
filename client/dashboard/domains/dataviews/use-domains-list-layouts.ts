import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { DOMAINS_LIST_CARDS_ONLY_MAX, DOMAINS_LIST_LAYOUTS } from './views';
import type { SupportedLayouts, View } from '@wordpress/dataviews';

/*
 * Small portfolios only get cards, until the user picks a layout. The choice is stored apart from the saved view,
 * which is deleted whenever it matches the default, so switching back to cards keeps the switch until Reset view.
 */
export function useDomainsListLayouts( {
	slug,
	domainCount,
	view,
	resetView,
}: {
	slug: string;
	domainCount: number;
	view: View;
	resetView?: () => void;
} ): {
	layouts: SupportedLayouts;
	recordLayoutChoice: ( oldView: View, newView: View ) => void;
	resetView?: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-layout-chosen-${ slug }` as const;
	const { data: hasChosenLayout } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: setHasChosenLayout } = useMutation(
		userPreferenceOptimisticMutation( preferenceName )
	);

	// A saved table view from before the choice was stored counts as a choice.
	const canSwitchLayout =
		domainCount > DOMAINS_LIST_CARDS_ONLY_MAX || !! hasChosenLayout || view.type !== 'grid';

	const recordLayoutChoice = ( oldView: View, newView: View ) => {
		if ( oldView.type !== newView.type && ! hasChosenLayout ) {
			setHasChosenLayout( true );
		}
	};

	const resetViewAndLayoutChoice =
		resetView || hasChosenLayout
			? () => {
					resetView?.();
					if ( hasChosenLayout ) {
						setHasChosenLayout( undefined );
					}
				}
			: undefined;

	return {
		layouts: canSwitchLayout ? DOMAINS_LIST_LAYOUTS : { grid: DOMAINS_LIST_LAYOUTS.grid },
		recordLayoutChoice,
		resetView: resetViewAndLayoutChoice,
	};
}
