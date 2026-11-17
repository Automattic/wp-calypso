import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useViewportMatch } from '@wordpress/compose';
import {
	DOMAINS_LIST_CARDS_ONLY_MAX,
	DOMAINS_LIST_LAYOUTS,
	withDomainsListSavedLayout,
	withDomainsListSmallScreenLayout,
} from './views';
import type { SupportedLayouts, View } from '@wordpress/dataviews';

/*
 * Small portfolios only get cards, until the user picks a layout. The choice is stored apart from the saved view,
 * which is deleted whenever it matches the default, so switching back to cards keeps the switch until Reset view.
 *
 * Small screens only get cards too, whatever the saved layout is. That one is only replaced for display:
 * `getViewToSave` puts it back on a changed view, so the user's choice still applies on a larger screen.
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
	view: View;
	getViewToSave: ( changedView: View ) => View;
	layouts: SupportedLayouts;
	recordLayoutChoice: ( oldView: View, newView: View ) => void;
	resetView?: () => void;
} {
	const preferenceName = `hosting-dashboard-dataviews-layout-chosen-${ slug }` as const;
	const { data: hasChosenLayout } = useSuspenseQuery( userPreferenceQuery( preferenceName ) );
	const { mutate: setHasChosenLayout } = useMutation(
		userPreferenceOptimisticMutation( preferenceName )
	);

	const isSmallScreen = useViewportMatch( 'medium', '<' );
	const shownView = withDomainsListSmallScreenLayout( view, isSmallScreen );
	const isLayoutReplaced = shownView !== view;

	// A saved table view from before the choice was stored counts as a choice.
	const canSwitchLayout =
		! isSmallScreen &&
		( domainCount > DOMAINS_LIST_CARDS_ONLY_MAX || !! hasChosenLayout || view.type !== 'grid' );

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
		view: shownView,
		getViewToSave: ( changedView: View ) =>
			isLayoutReplaced ? withDomainsListSavedLayout( changedView, view ) : changedView,
		layouts: canSwitchLayout ? DOMAINS_LIST_LAYOUTS : { grid: DOMAINS_LIST_LAYOUTS.grid },
		recordLayoutChoice,
		resetView: resetViewAndLayoutChoice,
	};
}
