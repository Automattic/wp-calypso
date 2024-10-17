import { useState } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PluginsBrowser from 'calypso/my-sites/plugins/plugins-browser';
import ThemeShowcase from 'calypso/my-sites/themes/theme-showcase';

export const MarketplaceHome = () => {
	const [ page, setPage ] = useState( 0 );

	return (
		<div>
			<SectionNav>
				<NavTabs>
					<NavItem onClick={ () => setPage( 0 ) }>Marketplace Home</NavItem>
					<NavItem onClick={ () => setPage( 1 ) }>Plugins</NavItem>
					<NavItem onClick={ () => setPage( 2 ) }>Themes</NavItem>
				</NavTabs>
			</SectionNav>

			{ page === 0 && <div>This is the landing page</div> }
			{ page === 1 && (
				<div>
					<PluginsBrowser category="" search="" hideHeader={ false } />
				</div>
			) }
			{ page === 2 && (
				<div>
					<ThemeShowcase
						origin="wpcom"
						defaultOption="signup"
						getScreenshotOption={ function () {
							return 'info';
						} }
						source="showcase"
						showUploadButton={ false }
						loggedOutComponent={ true }
					/>
				</div>
			) }
		</div>
	);
};
