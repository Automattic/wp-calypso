import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import SiteSelector from 'calypso/components/site-selector';
import { navigate } from 'calypso/lib/navigate';
import { useStore } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';

export default function SiteLevelProfileModal( props ) {
	const store = useStore();
	const translate = useTranslate();

	const [ isOpen, setIsOpen ] = useState( false );

	const onSiteSelect = ( siteId ) => {
		const state = store.getState();
		const profileUrl = getSiteAdminUrl( state, siteId, 'profile.php' );
		navigate( profileUrl );
	};

	const onClose = () => {
		setIsOpen( false );
	};

	const renderModal = () => {
		if ( ! isOpen ) {
			return null;
		}
		return (
			<Modal onRequestClose={ onClose } size="medium" title={ translate( 'Select a site' ) }>
				{ /* eslint-disable-next-line jsx-a11y/no-autofocus */ }
				<SiteSelector autoFocus onSiteSelect={ onSiteSelect } isReskinned />
			</Modal>
		);
	};

	return (
		<>
			<a href="/me" onClick={ setIsOpen }>
				{ props.children }
			</a>
			{ renderModal() }
		</>
	);
}
