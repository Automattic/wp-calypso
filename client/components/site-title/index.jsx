/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class SiteTitleControl extends React.Component {
	static propTypes = {
		autoFocusBlogname: PropTypes.bool,
		blogname: PropTypes.string,
		blogdescription: PropTypes.string,
		disabled: PropTypes.bool,
		isTitleRequired: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
	};

	static defaultProps = {
		autoFocusBlogname: false,
		blogname: '',
		blogdescription: '',
		isTitleRequired: false,
		disabled: false,
	};

	onChangeSiteTitle = event => {
		const blogdescription = this.props.blogdescription;
		const blogname = event.target.value;
		this.props.onChange( { blogname, blogdescription } );
	};

	onChangeDescription = event => {
		const blogname = this.props.blogname;
		const blogdescription = event.target.value;
		this.props.onChange( { blogname, blogdescription } );
	};

	renderValidation = blogname => {
		const isError = blogname ? false : true;

		return <FormInputValidation isError={ isError } text="Required field." />;
	};

	render() {
		const {
			autoFocusBlogname,
			blogname,
			blogdescription,
			disabled,
			isTitleRequired,
			translate,
		} = this.props;
		return (
			<div className="site-title">
				<FormFieldset>
					<FormLabel htmlFor="blogname">{ translate( 'Site Title' ) }</FormLabel>
					<FormTextInput
						autoFocus={ autoFocusBlogname }
						disabled={ disabled }
						id="blogname"
						onChange={ this.onChangeSiteTitle }
						value={ blogname }
					/>
					{ isTitleRequired ? this.renderValidation( blogname ) : null }
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="blogdescription">{ translate( 'Tagline' ) }</FormLabel>
					<FormTextInput
						disabled={ disabled }
						id="blogdescription"
						onChange={ this.onChangeDescription }
						value={ blogdescription }
					/>
				</FormFieldset>
			</div>
		);
	}
}

export default localize( SiteTitleControl );
