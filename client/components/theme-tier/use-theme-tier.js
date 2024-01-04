import getThemeTier from 'calypso/components/theme-tier/get-theme-tier';
import { useSelector } from 'calypso/state';

export default ( siteId, themeId ) =>
	useSelector( ( state ) => getThemeTier( state, siteId, themeId ) );
