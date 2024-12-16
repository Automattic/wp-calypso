import { useContext } from 'react';
import A4AConnectionModal from 'calypso/a8c-for-agencies/components/add-new-site-button/a4a-connection-modal';
import ImportFromWPCOMModal from 'calypso/a8c-for-agencies/components/add-new-site-button/import-from-wpcom-modal';
import JetpackConnectionModal from 'calypso/a8c-for-agencies/components/add-new-site-button/jetpack-connection-modal';
import { AddNewSiteContext } from '../context';

const AddNewSitesA4AModals = () => {
	const { visibleModalType, setVisibleModalType } = useContext( AddNewSiteContext );

	const handleOnClose = () => {
		setVisibleModalType( '' );
	};

	return (
		<>
			{ visibleModalType === 'a4a-connection' && <A4AConnectionModal onClose={ handleOnClose } /> }
			{ visibleModalType === 'jetpack-connection' && (
				<JetpackConnectionModal onClose={ handleOnClose } />
			) }
			{ visibleModalType === 'import-from-wpcom' && (
				<ImportFromWPCOMModal onClose={ handleOnClose } />
			) }
		</>
	);
};

export default AddNewSitesA4AModals;
