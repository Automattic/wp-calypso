import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { updateSort } from 'calypso/state/jetpack-agency-dashboard/actions';
import { defaultSortIcon, ascendingSortIcon, descendingSortIcon } from '../../icons';
import SitesOverviewContext from '../context';
import { AllowedTypes } from '../types';
import { siteColumnKeyMap } from '../utils';

import './style.scss';

const SORT_DIRECTION_ASC = 'asc';
const SORT_DIRECTION_DESC = 'desc';

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
	const { sort } = useContext( SitesOverviewContext );
	const dispatch = useDispatch();

	const { field, direction } = sort;

	const isDefault = field !== siteColumnKeyMap?.[ columnKey ] || ! field || ! direction;

	const setSort = () => {
		const updatedSort = { ...sort };
		if ( isDefault ) {
			updatedSort.field = siteColumnKeyMap?.[ columnKey ];
			updatedSort.direction = SORT_DIRECTION_ASC;
		} else if ( direction === SORT_DIRECTION_ASC ) {
			updatedSort.direction = SORT_DIRECTION_DESC;
		} else if ( direction === SORT_DIRECTION_DESC ) {
			updatedSort.field = '';
			updatedSort.direction = '';
		}

		dispatch( updateSort( updatedSort ) );
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
			className={ classNames( 'site-sort site-sort__clickable', {
				'site-sort__icon-large_screen': isLargeScreen,
			} ) }
			onKeyDown={ handleOnKeyDown }
			onClick={ setSort }
		>
			{ children }
			{ isSortable && (
				<Icon
					className={ classNames( 'site-sort__icon', {
						'site-sort__icon-hidden': isLargeScreen && isDefault,
					} ) }
					size={ 14 }
					icon={ getSortIcon() }
				/>
			) }
		</span>
	);
}
