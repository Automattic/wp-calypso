import { useRef } from 'react';
import ThemesSearchBar from 'calypso/my-sites/themes/v2/components/controls/themes-search-bar';
import ThemesShowcaseFilters from 'calypso/my-sites/themes/v2/components/controls/themes-showcase-filters';
import ThemesTierDropdown from 'calypso/my-sites/themes/v2/components/controls/themes-tier-dropdown';
import LotsHeader from 'calypso/my-sites/themes/v2/components/headers/lots-header';
import ThemeList from 'calypso/my-sites/themes/v2/components/views/theme-list';
import './lots.scss';

export default () => {
	const scrollRef = useRef( null );

	return (
		<div className="theme-showcase lots">
			<LotsHeader>
				<div className="themes__controls">
					<div className="theme__search">
						<ThemesSearchBar />
						<ThemesTierDropdown />
					</div>
				</div>
				<ThemesShowcaseFilters />
			</LotsHeader>
			<div className="themes__content" ref={ scrollRef }>
				<div className="themes__showcase">
					<ThemeList />
				</div>
			</div>
		</div>
	);
};
