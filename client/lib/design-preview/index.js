import siteTitle from './updaters/site-title';

const updaterFunctions = [
	siteTitle,
];

export function updatePreviewWithChanges( previewDocument, customizations ) {
	updaterFunctions.map( callback => callback( previewDocument, customizations ) );
}
