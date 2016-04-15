import siteTitle from './updaters/site-title';
import headerImage from './updaters/header-image';

const updaterFunctions = [
	siteTitle,
	headerImage,
];

export function updatePreviewWithChanges( previewDocument, customizations ) {
	updaterFunctions.map( callback => callback( previewDocument, customizations ) );
}
