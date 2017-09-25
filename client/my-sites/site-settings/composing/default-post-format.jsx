/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPostFormats from 'components/data/query-post-formats';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import { getPostFormats } from 'state/post-formats/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const DefaultPostFormat = ( {
	fields,
	onChangeField,
	eventTracker,
	isRequestingSettings,
	isSavingSettings,
	postFormats,
	siteId,
	translate
} ) => {
	return (
		<FormFieldset>
			{ siteId && <QueryPostFormats siteId={ siteId } /> }

			<FormLabel htmlFor="default_post_format">
				{ translate( 'Default Post Format' ) }
			</FormLabel>
			<FormSelect
				name="default_post_format"
				id="default_post_format"
				value={ fields.default_post_format }
				onChange={ onChangeField( 'default_post_format' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Selected Default Post Format' ) }
			>
				<option value="0">{ translate( 'Standard', { context: 'Post format' } ) }</option>
				{
					postFormats && map( postFormats, ( label, slug ) => {
						return <option key={ slug } value={ slug }>{ label }</option>;
					} )
				}
			</FormSelect>
		</FormFieldset>
	);
};

DefaultPostFormat.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

DefaultPostFormat.propTypes = {
	onChangeField: PropTypes.func.isRequired,
	eventTracker: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			postFormats: getPostFormats( state, siteId ),
		};
	}
)( localize( DefaultPostFormat ) );
