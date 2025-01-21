import { Button, Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import NavigationHeader from 'calypso/components/navigation-header';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';

type SubscribersHeaderProps = {
	selectedSiteId: number | undefined;
	disableCta: boolean;
	hideSubtitle?: boolean;
};

export const SubscribersHeader = ( {
	selectedSiteId,
	disableCta,
	hideSubtitle,
}: SubscribersHeaderProps ): ReactElement => {
	const HELP_CENTER_STORE = HelpCenter.register();
	const { setShowAddSubscribersModal } = useSubscribersPage();
	const localizeUrl = useLocalizeUrl();
	const { setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID || null;
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );

	const openHelpCenter = () => {
		setShowSupportDoc( localizeUrl( 'https://wordpress.com/support/paid-newsletters/' ) );
	};

	const paidNewsletterUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/newsletter/paid-newsletters/'
		: 'https://wordpress.com/support/paid-newsletters/';

	const subtitleOptions = {
		components: {
			link: (
				<a
					href={ localizeUrl( paidNewsletterUrl ) }
					target="blank"
					onClick={ ( event ) => {
						if ( ! isJetpackCloud() ) {
							event.preventDefault();
							openHelpCenter();
						}
					} }
					rel="noreferrer"
				/>
			),
		},
	};

	return (
		<NavigationHeader
			className="stats__section-header modernized-header"
			title={ translate( 'Subscribers' ) }
			subtitle={
				hideSubtitle
					? null
					: translate(
							'Add subscribers to your site and send them a free or {{link}}paid newsletter{{/link}}.',
							subtitleOptions
					  )
			}
			screenReader={ navItems.insights?.label }
			navigationItems={ [] }
		>
			<Button
				className="add-subscribers-button"
				primary
				disabled={ disableCta }
				onClick={ () => setShowAddSubscribersModal( true ) }
			>
				<Gridicon icon="plus" size={ 24 } />
				<span className="add-subscribers-button-text">{ translate( 'Add subscribers' ) }</span>
			</Button>
			<SubscribersHeaderPopover siteId={ selectedSiteId } />
		</NavigationHeader>
	);
};
