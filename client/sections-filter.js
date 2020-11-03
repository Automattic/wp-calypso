/**
 * Internal dependencies
 */
import config from 'calypso/config';

export default function isSectionEnabled( section ) {
	return isSectionNameEnabled( section.name );
}

export function isSectionNameEnabled( sectionName ) {
	const activeSections = config( 'sections' );
	const byDefaultEnableSection = config( 'enable_all_sections' );

	if ( activeSections && typeof activeSections[ sectionName ] !== 'undefined' ) {
		return activeSections[ sectionName ];
	}
	return byDefaultEnableSection;
}
