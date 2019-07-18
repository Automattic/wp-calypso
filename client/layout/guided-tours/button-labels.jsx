/** @format */

/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { useTranslate } from 'i18n-calypso';

// Returns React component with a localized label and optional icon
function button( label, icon ) {
	return () => {
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

// we use this translate to ensure the strings get picked up by the scripts that
// scan for translations, and 'useTranslate' above to make sure the strings get
// the right update hooks for runtime localization
const translate = ( ...args ) => args;

export const AddContentButton = button( translate( 'Add' ), <Gridicon icon="add-outline" /> );
export const AddMediaButton = button( translate( 'Add Media' ) );
export const AddNewButton = button( translate( 'Add New' ), <Gridicon icon="add-image" /> );
export const AllThemesButton = button( translate( 'All Themes' ) );
export const ChangeButton = button( translate( 'Change', { context: 'verb' } ) );
export const ContinueButton = button( translate( 'Continue' ) );
export const DoneButton = button( translate( 'Done' ) );
export const EditButton = button( translate( 'Edit' ) );
export const EditImageButton = button( translate( 'Edit Image' ), <Gridicon icon="pencil" /> );
export const PublishButton = button( translate( 'Publish' ) );
export const SaveSettingsButton = button( translate( 'Save Settings' ) );
export const SetFeaturedImageButton = button( translate( 'Set Featured Image' ) );
export const SettingsButton = button( translate( 'Settings' ), <Gridicon icon="cog" /> );
export const SiteTaglineButton = button( translate( 'Site Tagline' ) );
export const SiteTitleButton = button( translate( 'Site Title' ) );
export const UpdateButton = button( translate( 'Update' ) );
export const ViewSiteButton = button( translate( 'View Site' ) );
