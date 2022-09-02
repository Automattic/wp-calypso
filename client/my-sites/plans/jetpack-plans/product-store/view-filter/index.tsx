import { useTranslate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';
import { addQueryArgs } from 'calypso/lib/route';
import type { ViewFilterProps } from '../types';

import './style.scss';

export const ViewFilter: React.FC< ViewFilterProps > = ( { currentView, setCurrentView } ) => {
	const translate = useTranslate();

	const currentPath = window.location.pathname + window.location.search;

	return (
		<div className="jetpack-product-store__view-filter">
			<SegmentedControl className="jetpack-product-store__view-filter--toggle" compact primary>
				<SegmentedControl.Item
					onClick={ () => setCurrentView( 'products' ) }
					selected={ currentView === 'products' }
					path={ addQueryArgs( { view: 'products' }, currentPath ) }
				>
					{ translate( 'Products' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					onClick={ () => setCurrentView( 'bundles' ) }
					selected={ currentView === 'bundles' }
					path={ addQueryArgs( { view: 'bundles' }, currentPath ) }
				>
					{ translate( 'Bundles' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
