import { useTranslate } from 'i18n-calypso';
import SidebarSearch from 'calypso/layout/global-sidebar/menu-items/search/search';

export const GlobalSidebarHeader = () => {
	const translate = useTranslate();
	return (
		<div className="sidebar__header">
			<a href="/sites" className="link-logo">
				<span className="dotcom"></span>
			</a>
			<span className="gap"></span>
			<SidebarSearch tooltip={ translate( 'Search' ) } />
		</div>
	);
};

export default GlobalSidebarHeader;
