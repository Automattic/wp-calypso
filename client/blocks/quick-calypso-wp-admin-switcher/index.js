/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import SegmentedControl from 'calypso/components/segmented-control';
import SelectDropdown from 'calypso/components/select-dropdown';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { useMobileBreakpoint } from '@automattic/viewport-react';

const QuickCalypsoWpAdminSwitcher = ( { wpAdminPath } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const fullWpAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId, wpAdminPath ) );
	const isMobile = useMobileBreakpoint();

	// Only visible on single-site screens of WordPress.com Simple and Atomic sites.
	if ( ! wpAdminPath || ! fullWpAdminUrl || ! siteId || ( isJetpack && ! isAtomic ) ) {
		return null;
	}

	const Component = isMobile ? SelectDropdown : SegmentedControl;

	return (
		<Component
			className="quick-calypso-wp-admin-switcher"
			compact
			primary
			selectedText={ translate( 'Default' ) }
		>
			<Component.Item
				selected
				title={ translate( 'See the default WordPress.com version of this screen' ) }
			>
				{ translate( 'Default' ) }
			</Component.Item>
			<Component.Item path={ fullWpAdminUrl } title={ translate( 'See this screen on WP Admin' ) }>
				{ translate( 'WP Admin' ) }
			</Component.Item>
		</Component>
	);
};

export default QuickCalypsoWpAdminSwitcher;
