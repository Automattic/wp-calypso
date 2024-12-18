import { useMemo } from 'react';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import AddNewSiteA4AMenuItems from './a4a';
import type { AddNewSiteMenuItemsProps } from '../types';

const AddNewSiteMenuItems = ( props: AddNewSiteMenuItemsProps ) => {
	const renderContent = useMemo( () => {
		switch ( true ) {
			case isA8CForAgencies():
				return <AddNewSiteA4AMenuItems { ...props } />;
			default:
				return null;
		}
	}, [ props ] );
	return renderContent;
};

export default AddNewSiteMenuItems;
