import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useContext } from 'react';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import {
	defaultSortIcon,
	ascendingSortIcon,
	descendingSortIcon,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/icons';
import { AllowedTypes } from '../types';

import './style.scss';

const SORT_DIRECTION_ASC = 'asc';
const SORT_DIRECTION_DESC = 'desc';

// Mapping the columns to the site data keys
const SITE_COLUMN_KEY_MAP: { [ key: string ]: string } = {
	site: 'url',
};

export default function SiteSort( {
	columnKey,
	isLargeScreen,
	children,
	isSortable,
}: {
	columnKey: AllowedTypes;
	isLargeScreen?: boolean;
	children?: React.ReactNode;
	isSortable?: boolean;
} ) {
	const { dataViewsState, setDataViewsState } = useContext( SitesDashboardContext );

	const { field, direction } = dataViewsState.sort ?? {};

	const isDefault = field !== SITE_COLUMN_KEY_MAP?.[ columnKey ] || ! field || ! direction;

	const setSort = () => {
		let updatedSort = dataViewsState.sort;
		if ( isDefault ) {
			updatedSort = {
				field: SITE_COLUMN_KEY_MAP?.[ columnKey ],
				direction: SORT_DIRECTION_ASC,
			};
		} else if ( direction === SORT_DIRECTION_ASC ) {
			updatedSort = {
				field: SITE_COLUMN_KEY_MAP?.[ columnKey ],
				direction: SORT_DIRECTION_ASC,
			};
		} else if ( direction === SORT_DIRECTION_DESC ) {
			updatedSort = undefined;
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
}
