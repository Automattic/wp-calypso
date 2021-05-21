/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import usePostFormatsQuery from 'calypso/data/post-formats/use-post-formats-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const DefaultPostFormat = ( {
	fields,
	onChangeField,
	eventTracker,
	isRequestingSettings,
	isSavingSettings,
	translate,
} ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const { data } = usePostFormatsQuery( siteId );

	return (
		<FormFieldset>
			<FormLabel htmlFor="default_post_format">{ translate( 'Default post format' ) }</FormLabel>
			<FormSelect
				name="default_post_format"
				id="default_post_format"
				value={ fields.default_post_format }
				onChange={ onChangeField( 'default_post_format' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Selected Default Post Format' ) }
			>
				<option value="0">{ translate( 'Standard', { context: 'Post format' } ) }</option>
				{ data &&
					map( data.formats, ( label, slug ) => (
						<option key={ slug } value={ slug }>
							{ label }
						</option>
					) ) }
			</FormSelect>
		</FormFieldset>
	);
};

DefaultPostFormat.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

DefaultPostFormat.propTypes = {
	onChangeField: PropTypes.func.isRequired,
	eventTracker: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default localize( DefaultPostFormat );
