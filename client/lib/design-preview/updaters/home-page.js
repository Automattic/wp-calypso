let previousCustomizations = {};

export default function homePage( previewDoc, customizations, fetchPreviewMarkup ) {
	if ( hasHomePageChanged( previousCustomizations, customizations ) ) {
		fetchPreviewMarkup();
	}
	previousCustomizations = customizations;
}

function hasHomePageChanged( prevCustomizations, customizations ) {
	if ( ! customizations.homePage ) {
		return false;
	}
	return ( prevCustomizations.homePage !== customizations.homePage );
}
