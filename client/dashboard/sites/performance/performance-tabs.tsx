import { isEnabled } from '@automattic/calypso-config';
import { useNavigate } from '@tanstack/react-router';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type PerformanceTab = 'frontend' | 'backend';

const TABS = [
	{ name: 'frontend' as const, title: __( 'Frontend' ) },
	{ name: 'backend' as const, title: __( 'Backend' ) },
];

/**
 * Frontend/Backend tabs for the legacy (non-omnibar) layout.
 *
 * The omnibar sidebar exposes Frontend/Backend as a submenu under Performance,
 * so this fallback only renders when the sidebar is not available.
 */
export default function PerformanceTabs( {
	siteSlug,
	activeTab,
}: {
	siteSlug: string;
	activeTab: PerformanceTab;
} ) {
	const navigate = useNavigate();

	if ( isEnabled( 'dashboard/omnibar' ) || ! isEnabled( 'performance/apm' ) ) {
		return null;
	}

	return (
		<TabPanel
			activeClass="is-active"
			tabs={ TABS }
			initialTabName={ activeTab }
			onSelect={ ( name ) => {
				if ( name === activeTab ) {
					return;
				}
				navigate( { to: `/sites/${ siteSlug }/performance/${ name }` } );
			} }
		>
			{ () => null }
		</TabPanel>
	);
}
