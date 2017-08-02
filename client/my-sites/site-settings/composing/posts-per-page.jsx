/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const PostsPerPage = ( {
	eventTracker,
	fields,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	translate,
	uniqueEventTracker,
} ) => {
	if ( ! fields.hasOwnProperty( 'posts_per_page' ) ) {
		return null;
	}

	return (
		<FormFieldset>
			<FormLabel htmlFor="posts_per_page">{ translate( 'Posts Per Page' ) }</FormLabel>
			<FormInput
				name="posts_per_page"
				type="number"
				step="1"
				min="1"
				id="posts_per_page"
				value={ fields.posts_per_page || 10 }
				onChange={ onChangeField( 'posts_per_page' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Clicked Posts Per Page Field' ) }
				onKeyPress={ uniqueEventTracker( 'Typed in Posts Per Page Field' ) }
			/>
			<FormSettingExplanation>
				{ translate( 'On blog pages, the number of posts to show per page.' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};

PostsPerPage.defaultProps = {
	fields: {},
	isRequestingSettings: true,
	isSavingSettings: false,
};

PostsPerPage.propTypes = {
	eventTracker: PropTypes.func.isRequired,
	fields: PropTypes.object,
	isRequestingSettings: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	onChangeField: PropTypes.func.isRequired,
	uniqueEventTracker: PropTypes.func.isRequired,
};

export default localize( PostsPerPage );
