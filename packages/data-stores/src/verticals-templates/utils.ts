export function getVerticalTemplateKey( verticalId: string, templateSlug: string ) {
	// We'll _join_ verticalId and templateSlug to get unique entries into a flat data structure.
	// Yes, that's `verticalID + joinCharacter + templateSlug`
	return `${ verticalId }\u2a1d${ templateSlug }`;
}
