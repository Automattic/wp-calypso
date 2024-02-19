import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import SiteSelector from 'calypso/components/site-selector';
import { navigate } from 'calypso/lib/navigate';
import { addSiteFragment } from 'calypso/lib/route';
import { useSelector, useStore } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';

export default function ThemeSiteSelectorModal( { isOpen, onClose, themeId } ) {
	const store = useStore();
	const translate = useTranslate();

	const theme = useSelector( ( state ) => getCanonicalTheme( state, null, themeId ) );

	const currentRoute = useSelector( getCurrentRoute );

	const onSiteSelect = ( siteId ) => {
		const state = store.getState();

		const siteSlug = getSiteSlug( state, siteId );
		const siteTitle = getSiteTitle( state, siteId );

		const pathWithSite = addSiteFragment( currentRoute, siteSlug );
		navigate( pathWithSite );
		onClose( { siteTitle } );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="theme-site-selector-modal"
			onRequestClose={ onClose }
			size="medium"
			title={ translate( 'Select a site to activate %(themeName)s', {
				args: { themeName: theme?.name },
			} ) }
		>
			<div className="theme-site-selector-modal__content">
				<p>{ translate( 'Some unsupported sites may be hidden.' ) }</p>
				<SiteSelector onSiteSelect={ onSiteSelect } isReskinned />
			</div>
		</Modal>
	);
}
