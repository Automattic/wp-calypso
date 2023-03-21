import { Icon } from '@wordpress/icons';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { updateSort } from 'calypso/state/jetpack-agency-dashboard/actions';
import { defaultSortIcon, ascendingSortIcon, descendingSortIcon } from '../../icons';
import SitesOverviewContext from '../context';
import { AllowedTypes } from '../types';
import { siteColumnKeyMap } from '../utils';

export default function SiteSort( { columnKey }: { columnKey: AllowedTypes } ) {
	const { sort } = useContext( SitesOverviewContext );
	const dispatch = useDispatch();

	const setSort = () => {
		let updatedSort = { ...sort };
		if ( sort.field !== siteColumnKeyMap?.[ columnKey ] || ! sort.field || ! sort.direction ) {
			updatedSort.field = siteColumnKeyMap?.[ columnKey ];
			updatedSort.direction = 'asc';
		}
		if ( sort.direction === 'asc' ) {
			updatedSort.direction = 'desc';
		}
		if ( sort.direction === 'desc' ) {
			updatedSort = null;
		}

		dispatch( updateSort( updatedSort ) );
	};

	if ( sort.field !== siteColumnKeyMap?.[ columnKey ] || ! sort.field || ! sort.direction ) {
		return (
			<Icon className="site-sort__icon" size={ 14 } onClick={ setSort } icon={ defaultSortIcon } />
		);
	}

	const getSortIcon = () => {
		if ( sort.direction === 'asc' ) {
			return ascendingSortIcon;
		} else if ( sort.direction === 'desc' ) {
			return descendingSortIcon;
		}
		return defaultSortIcon;
	};

	return (
		<span>
			<Icon className="site-sort__icon" size={ 14 } onClick={ setSort } icon={ getSortIcon() } />
		</span>
	);
}
