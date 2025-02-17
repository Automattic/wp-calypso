import './style.scss';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import SiteSelector from 'calypso/components/site-selector';
import { navigate } from 'calypso/lib/navigate';
import { addSiteFragment } from 'calypso/lib/route';
import { useSelector, useStore } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import getVisibleSites from 'calypso/state/selectors/get-visible-sites';
import { getSiteSlug, getSiteTitle } from 'calypso/state/sites/selectors';

export default function ThemeSiteSelectorModal( { isOpen, navigateOnClose = true, onClose } ) {
	const store = useStore();
	const translate = useTranslate();

	const currentRoute = useSelector( getCurrentRoute );
	const sites = useSelector( ( state ) => getSitesItems( state ) );
	const visibleSites = useSelector( ( state ) => getVisibleSites( state ) );
	const hasNonVisibleSites = Object.keys( sites ).length !== visibleSites.length;

	const onSiteSelect = ( siteId ) => {
		const state = store.getState();

		const siteSlug = getSiteSlug( state, siteId );
		const siteTitle = getSiteTitle( state, siteId );

		const pathWithSite = addSiteFragment( currentRoute, siteSlug );
		navigateOnClose && navigate( pathWithSite );
		onClose( { siteSlug, siteTitle } );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			overlayClassName="theme-site-selector-modal"
			onRequestClose={ onClose }
			size="medium"
			title={ translate( 'Select a site', {
				comment: 'Title for a modal dialog that lists all the user sites',
			} ) }
		>
			<div className="theme-site-selector-modal__content">
				{ hasNonVisibleSites && <p>{ translate( 'Some unsupported sites are hidden.' ) }</p> }
				{ /* eslint-disable-next-line jsx-a11y/no-autofocus */ }
				<SiteSelector autoFocus onSiteSelect={ onSiteSelect } />
			</div>
		</Modal>
	);
}
