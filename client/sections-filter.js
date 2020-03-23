/**
 * Internal dependencies
 */
import config from 'config';

export default function isSectionEnabled( section ) {
	const activeSections = config( 'sections' );
	const byDefaultEnableSection = config( 'enable_all_sections' );

	if ( activeSections && typeof activeSections[ section.name ] !== 'undefined' ) {
		return activeSections[ section.name ];
	}
	return byDefaultEnableSection;
}
