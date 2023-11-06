import { useDispatch, useSelector } from 'calypso/state';
import { setThemesBookmark } from 'calypso/state/themes/themes-ui/actions';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { useThemeContext } from '../theme-context';
import { useThemeShowcaseContext } from '../theme-showcase-context';

export default function useThemesBookmark() {
	const { themeId } = useThemeContext();
	const { bookmarkRef } = useThemeShowcaseContext();

	const themesBookmark = useSelector( getThemesBookmark );

	const dispatch = useDispatch();
	const setBookmark = () => dispatch( setThemesBookmark( themeId ) );

	const bookmark = themesBookmark === themeId ? bookmarkRef : null;

	return {
		bookmarkRef: bookmark,
		setThemesBookmark: setBookmark,
		themesBookmark,
	};
}
