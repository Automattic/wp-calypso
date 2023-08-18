import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import Search from 'calypso/components/search';

class DomainsTableInputFilter extends Component {
	render() {
		return (
			<Search
				additionalClasses="all-domains__search-input"
				id="all-domains__search-input"
				name="all-domains__search-input"
				placeholder="Search for a domain..."
			/>
		);
	}
}

export default DomainsTableInputFilter;
