import React from 'react';
import AddNewSiteA4AMenuItems, { AddNewSiteA4AMenuItemsProps } from './a4a';

type Props = {
	children: React.ReactNode;
};

const AddNewSiteMenuItems = ( { children }: Props ) => {
	return children;
};

AddNewSiteMenuItems.A4A = ( props: AddNewSiteA4AMenuItemsProps ) => (
	<AddNewSiteA4AMenuItems { ...props } />
);

export default AddNewSiteMenuItems;
