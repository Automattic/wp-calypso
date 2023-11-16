import { useContext } from 'react';
import { connectOptions } from 'calypso/my-sites/themes/theme-options';
import ThemesSelection from 'calypso/my-sites/themes/themes-selection';
import ThemesShowcaseContext from 'calypso/my-sites/themes/v2/context/themes-showcase-context';
import { ThemeOption } from 'calypso/my-sites/themes/v2/types';
import getThemeOptionProvider from 'calypso/my-sites/themes/v2/util/get-theme-option-provider';

type ThemeListProps = {
	options: Record< string, ThemeOption >;
	siteId?: number;
};

export default connectOptions( ( props: ThemeListProps ) => {
	const { options, siteId } = props;
	const { filter, tier, search, category } = useContext( ThemesShowcaseContext );

	return (
		<div className="theme-showcase__all-themes">
			<ThemesSelection
				getOptions={ getThemeOptionProvider( options, siteId ) }
				filter={ filter }
				tier={ tier }
				search={ search }
				tabFilter={ category }
			/>
		</div>
	);
} );
