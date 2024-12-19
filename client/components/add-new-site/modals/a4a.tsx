import { useContext } from 'react';
import A4AConnectionModal from 'calypso/a8c-for-agencies/components/add-new-site-button/a4a-connection-modal';
import ImportFromWPCOMModal from 'calypso/a8c-for-agencies/components/add-new-site-button/import-from-wpcom-modal';
import JetpackConnectionModal from 'calypso/a8c-for-agencies/components/add-new-site-button/jetpack-connection-modal';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import AddNewSiteContext from 'calypso/components/add-new-site/context';

const AddNewSitesA4AModals = () => {
	const { visibleModalType, setVisibleModalType } = useContext( AddNewSiteContext );
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();

	const handleOnClose = () => {
		setVisibleModalType( '' );
	};

	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	if ( visibleModalType === 'a4a-connection' ) {
		return <A4AConnectionModal onClose={ handleOnClose } />;
	}
	if ( visibleModalType === 'jetpack-connection' ) {
		return <JetpackConnectionModal onClose={ handleOnClose } />;
	}
	if ( visibleModalType === 'import-from-wpcom' ) {
		return <ImportFromWPCOMModal onClose={ handleOnClose } />;
	}
	if ( visibleModalType === 'dev-site-configurations' ) {
		return (
			<SiteConfigurationsModal
				closeModal={ handleOnClose }
				randomSiteName={ randomSiteName }
				isRandomSiteNameLoading={ isRandomSiteNameLoading }
				onCreateSiteSuccess={ onCreateSiteSuccess }
			/>
		);
	}
	return null;
};

export default AddNewSitesA4AModals;
