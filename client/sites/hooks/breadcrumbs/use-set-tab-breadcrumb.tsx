import { SiteExcerptData } from '@automattic/sites';
import { useEffect } from 'react';
import { FeaturePreviewInterface } from 'calypso/layout/hosting-dashboard/item-view/types';
import { useDispatch } from 'calypso/state';
import { appendBreadcrumb, updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import SiteIcon from '../../components/sites-dataviews/site-icon';

export function useSetTabBreadcrumb( {
	site,
	features,
	selectedFeatureId,
}: {
	site: SiteExcerptData;
	features: FeaturePreviewInterface[];
	selectedFeatureId?: string;
} ) {
	const dispatch = useDispatch();

	const selectedFeature = features.find( ( feature ) => feature.tab.selected );
	const tab = selectedFeature?.tab;
	const tabId = selectedFeature?.id;

	useEffect( () => {
		if ( ! tab ) {
			return;
		}

		const breadcrumb = {
			id: 'tab',
			label: tab.label,
			href: tab.href,
		};
		if ( tabId === selectedFeatureId ) {
			// This is the default feature of the tab, so no feature breadcrumb will be added.
			// Replace the entire breadcrumbs with the tab breadcrumb.
			dispatch( updateBreadcrumbs( [ breadcrumb ] ) );
		} else {
			// The feature breadcrumb has been added, so we append the tab breadcrumb.
			dispatch( appendBreadcrumb( breadcrumb ) );
		}
		dispatch(
			appendBreadcrumb( {
				id: 'site',
				label: site.title,
				href: `/overview/${ site.slug }`,
				icon: <SiteIcon site={ site } viewType="breadcrumb" disableClick />,
			} )
		);
	}, [ site, features, selectedFeatureId ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
