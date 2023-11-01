import { addQueryArgs } from '@wordpress/url';
import { useSelector } from 'calypso/state';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useThemeContext } from '../theme-context';
import useIsFSEActive from './use-is-fse-active';

export default function useThemeCustomizeUrl() {
	const { selectedStyleVariation, themeId } = useThemeContext();

	const siteId = useSelector( getSelectedSiteId );
	const isFSEActive = useIsFSEActive();

	const themeCustomizeUrl = useSelector( ( state ) =>
		addQueryArgs( getCustomizeUrl( state, themeId, siteId, isFSEActive ), {
			from: 'theme-info',
			style_variation: selectedStyleVariation?.slug,
		} )
	);

	return themeCustomizeUrl;
}
