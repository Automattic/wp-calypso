import { getQueryArg } from '@wordpress/url';
import { useContext, useEffect } from 'react';
import A4AConnectionModal from 'calypso/a8c-for-agencies/components/add-new-site-button/a4a-connection-modal';
import ImportFromWPCOMModal from 'calypso/a8c-for-agencies/components/add-new-site-button/import-from-wpcom-modal';
import JetpackConnectionModal from 'calypso/a8c-for-agencies/components/add-new-site-button/jetpack-connection-modal';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import { AddNewSiteContext } from '../context';

const AddNewSitesA4AModals = () => {
	const { visibleModalType, setVisibleModalType } = useContext( AddNewSiteContext );
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();

	const handleOnClose = () => {
		setVisibleModalType( '' );
	};

	const shouldAutoOpenDevSiteConfigModal = Boolean(
		getQueryArg( window.location.href, 'add_new_dev_site' )
	);

	useEffect( () => {
		if ( shouldAutoOpenDevSiteConfigModal ) {
			setVisibleModalType( 'dev-site-configurations' );
		}
	}, [ shouldAutoOpenDevSiteConfigModal, setVisibleModalType ] );

	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	return (
		<>
			{ visibleModalType === 'a4a-connection' && <A4AConnectionModal onClose={ handleOnClose } /> }
			{ visibleModalType === 'jetpack-connection' && (
				<JetpackConnectionModal onClose={ handleOnClose } />
			) }
			{ visibleModalType === 'import-from-wpcom' && (
				<ImportFromWPCOMModal onClose={ handleOnClose } />
			) }
			{ visibleModalType === 'dev-site-configurations' && (
				<SiteConfigurationsModal
					closeModal={ handleOnClose }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
				/>
			) }
		</>
	);
};

export default AddNewSitesA4AModals;
