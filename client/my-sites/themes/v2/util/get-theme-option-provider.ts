import { pickBy } from 'lodash';
import { addTracking } from 'calypso/my-sites/themes/helpers';
import { ThemeOption } from 'calypso/my-sites/themes/v2/types';

const getThemeOptionProvider =
	( options: Record< string, ThemeOption >, siteId?: number ) => ( themeId: string ) =>
		pickBy(
			addTracking( options ),
			( option: ThemeOption ) => ! option.hideForTheme?.( themeId, siteId )
		);

export default getThemeOptionProvider;
