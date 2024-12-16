import React from 'react';
import AddNewSitesA4AModals from './a4a';

type Props = {
	children: React.ReactNode;
};

const AddNewSiteModals = ( { children }: Props ) => {
	return children;
};

AddNewSiteModals.A4A = () => <AddNewSitesA4AModals />;

export default AddNewSiteModals;
