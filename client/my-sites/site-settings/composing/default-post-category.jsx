import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import QueryTerms from 'calypso/components/data/query-terms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import { getTermsForQuery } from 'calypso/state/terms/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const DefaultPostCategory = ( {
	fields,
	onChangeField,
	eventTracker,
	isRequestingSettings,
	isSavingSettings,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();
	const query = { page: 0 };
	const terms = useSelector( ( state ) => getTermsForQuery( state, siteId, 'category', query ) );

	return (
		<FormFieldset>
			<QueryTerms siteId={ siteId } taxonomy="category" query={ query } />
			<FormLabel htmlFor="default_category">{ translate( 'Default post category' ) }</FormLabel>
			<FormSelect
				name="default_category"
				id="default_category"
				value={ fields.default_category }
				onChange={ onChangeField( 'default_category' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Selected Default Post Category' ) }
			>
				{ terms &&
					terms.map( ( { ID, name } ) => (
						<option key={ ID } value={ ID }>
							{ name }
						</option>
					) ) }
			</FormSelect>
		</FormFieldset>
	);
};

DefaultPostCategory.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

DefaultPostCategory.propTypes = {
	onChangeField: PropTypes.func.isRequired,
	eventTracker: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default DefaultPostCategory;
