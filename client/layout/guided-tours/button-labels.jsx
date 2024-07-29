import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

// Returns React component with a localized label and optional icon
function button( label, icon ) {
	return () => {
		// eslint-disable-next-line wpcalypso/i18n-translate-identifier
		const tr = useTranslate();
		return (
			<strong>
				{ icon }
				{ icon && '\u00A0' /* NBSP between icon and label */ }
				{ tr( ...label ) }
			</strong>
		);
	};
}

// we use this translate because the i18n scripts are scanning for
// translate( string ) calls, but the runtime translation hooks are set up with
// the 'useTranslate' above
const translate = ( ...args ) => args;

export const AddNewButton = button( translate( 'Add New' ), <Gridicon icon="add-image" /> );
export const DoneButton = button( translate( 'Done' ) );
export const EditButton = button( translate( 'Edit' ) );
export const EditImageButton = button( translate( 'Edit Image' ), <Gridicon icon="pencil" /> );
export const SiteTitleButton = button( translate( 'Site Title' ) );
export const SiteTaglineButton = button( translate( 'Site Tagline' ) );
