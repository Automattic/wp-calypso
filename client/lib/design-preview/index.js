import siteTitle from './updaters/site-title';
import headerImage from './updaters/header-image';
import siteLogo from './updaters/site-logo';

const updaterFunctions = [
	siteTitle,
	headerImage,
	siteLogo,
];

export function updatePreviewWithChanges( previewDocument, customizations ) {
	updaterFunctions.map( callback => callback( previewDocument, customizations ) );
}
