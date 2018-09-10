/** @format */

/**
 * External dependencies
 */
import React from 'react';
import GridiconCog from 'gridicons/dist/cog';
import GridiconPencil from 'gridicons/dist/pencil';
import GridiconAddImage from 'gridicons/dist/add-image';
import GridiconAddOutline from 'gridicons/dist/add-outline';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

// Returns React component with a localized label and optional icon
function button( label, icon ) {
	return localize( ( { translate: tr } ) => (
		<strong>
			{ icon }
			{ icon && '\u00A0' /* NBSP between icon and label */ }
			{ tr( label ) }
		</strong>
	) );
}

// Localized texts need to be wrapped in a `translate` function to be found by the l10n bot
const translate = identity;

export const AddContentButton = button( translate( 'Add' ), <GridiconAddOutline /> );
export const AddMediaButton = button( translate( 'Add Media' ) );
export const AddNewButton = button( translate( 'Add New' ), <GridiconAddImage /> );
export const AllThemesButton = button( translate( 'All Themes' ) );
export const ChangeButton = button( translate( 'Change' ) );
export const ContinueButton = button( translate( 'Continue' ) );
export const DoneButton = button( translate( 'Done' ) );
export const EditButton = button( translate( 'Edit' ) );
export const EditImageButton = button( translate( 'Edit Image' ), <GridiconPencil /> );
export const PublishButton = button( translate( 'Publish' ) );
export const SaveSettingsButton = button( translate( 'Save Settings' ) );
export const SetFeaturedImageButton = button( translate( 'Set Featured Image' ) );
export const SettingsButton = button( translate( 'Settings' ), <GridiconCog /> );
export const SiteTaglineButton = button( translate( 'Site Tagline' ) );
export const SiteTitleButton = button( translate( 'Site Title' ) );
export const UpdateButton = button( translate( 'Update' ) );
export const ViewSiteButton = button( translate( 'View Site' ) );
