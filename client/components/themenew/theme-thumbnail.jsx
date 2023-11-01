import { Gridicon } from '@automattic/components';
import { DesignPreviewImage, isDefaultGlobalStylesVariationSlug } from '@automattic/design-picker';
import photon from 'photon';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getTheme, isExternallyManagedTheme } from 'calypso/state/themes/selectors';
import { useThemeContext } from './theme-context';

export default function ThemeThumbnail() {
	const { selectedStyleVariation, themeId } = useThemeContext();

	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', themeId ) );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);

	const { description, screenshot, stylesheet } = theme;

	if ( ! screenshot ) {
		return (
			<div className="theme__no-screenshot">
				<Gridicon icon="themes" size={ 48 } />
			</div>
		);
	}

	/**
	 * mShots don't work well with SSR, since it shows a placeholder image by default
	 * until the snapshot request is completed.
	 *
	 * With that in mind, we only use mShots for non-default style variations to ensure
	 * that there is no flash of image transition from static image to mShots on page load.
	 */
	if (
		! isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug ) &&
		! isExternallyManaged
	) {
		return (
			<DesignPreviewImage
				design={ { slug: themeId, recipe: { stylesheet } } }
				styleVariation={ selectedStyleVariation }
			/>
		);
	}

	const fit = '479,360';
	const themeImgSrc = photon( screenshot, { fit } ) || screenshot;
	const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } ) || screenshot;

	return (
		<img
			alt={ decodeEntities( description ) }
			className="theme__img"
			src={ themeImgSrc }
			srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
		/>
	);
}
