import siteTitle from './updaters/site-title';
import headerImage from './updaters/header-image';
import homePage from './updaters/home-page';

const updaterFunctions = [
	siteTitle,
	headerImage,
	homePage,
];

export function updatePreviewWithChanges( previewDocument, customizations, reloadPreview ) {
	updaterFunctions.map( callback => callback( previewDocument, customizations, reloadPreview ) );
}
