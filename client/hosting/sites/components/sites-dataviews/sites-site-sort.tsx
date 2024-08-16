// Copied from client/a8c-for-agencies/sections/sites/site-sort/index.tsx as we don't have SitesDashboardContext here.
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import {
	defaultSortIcon,
	ascendingSortIcon,
	descendingSortIcon,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/icons';
import { addDummyDataViewPrefix, removeDummyDataViewPrefix } from './utils';
import type { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

import 'calypso/a8c-for-agencies/sections/sites/site-sort/style.scss';

const SORT_DIRECTION_ASC = 'asc';
const SORT_DIRECTION_DESC = 'desc';

interface SiteSortProps {
	columnKey: string;
	isLargeScreen?: boolean;
	children?: React.ReactNode;
	isSortable?: boolean;
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
}

export const SiteSort = ( {
	columnKey,
	isLargeScreen,
	children,
	isSortable,
	dataViewsState,
	setDataViewsState,
}: SiteSortProps ) => {
	const { field, direction } = dataViewsState.sort ?? {};
	const isDefault = ! field || removeDummyDataViewPrefix( field ) !== columnKey || ! direction;

	const setSort = () => {
		let updatedSort = dataViewsState.sort;
		if ( isDefault ) {
			updatedSort = {
				field: addDummyDataViewPrefix( columnKey ),
				direction: SORT_DIRECTION_ASC,
			};
		} else if ( direction === SORT_DIRECTION_ASC ) {
			updatedSort = {
				field: addDummyDataViewPrefix( columnKey ),
				direction: SORT_DIRECTION_DESC,
			};
		} else if ( direction === SORT_DIRECTION_DESC ) {
			updatedSort = {
				field: addDummyDataViewPrefix( 'last-interacted' ),
				direction: SORT_DIRECTION_DESC,
			};
		}

		setDataViewsState( ( sitesViewState ) => ( {
			...sitesViewState,
			sort: updatedSort,
		} ) );
	};

	const getSortIcon = () => {
		if ( isDefault ) {
			return defaultSortIcon;
		} else if ( direction === SORT_DIRECTION_ASC ) {
			return ascendingSortIcon;
		} else if ( direction === SORT_DIRECTION_DESC ) {
			return descendingSortIcon;
		}
		return defaultSortIcon;
	};

	if ( ! isSortable ) {
		return <span className="site-sort">{ children }</span>;
	}

	const handleOnKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			setSort();
		}
	};

	return (
		<span
			role="button"
			tabIndex={ 0 }
			className={ clsx( 'site-sort site-sort__clickable', {
				'site-sort__icon-large_screen': isLargeScreen,
			} ) }
			onKeyDown={ handleOnKeyDown }
			onClick={ setSort }
		>
			{ children }
			{ isSortable && (
				<Icon
					className={ clsx( 'site-sort__icon', {
						'site-sort__icon-hidden': isLargeScreen && isDefault,
					} ) }
					size={ 14 }
					icon={ getSortIcon() }
				/>
			) }
		</span>
	);
};
