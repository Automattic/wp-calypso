/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

const SiteTitleControl = React.createClass( {
	propTypes: {
		blogname: PropTypes.string,
		blogdescription: PropTypes.string,
		onChange: PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			blogname: '',
			blogdescription: '',
		};
	},

	onChangeSiteTitle( event ) {
		const blogdescription = this.props.blogdescription;
		const blogname = event.target.value;
		this.props.onChange( { blogname, blogdescription } );
	},

	onChangeDescription( event ) {
		const blogname = this.props.blogname;
		const blogdescription = event.target.value;
		this.props.onChange( { blogname, blogdescription } );
	},

	render() {
		return (
		    <div className="site-title">
				<FormFieldset>
					<FormLabel htmlFor="blogname">{ this.props.translate( 'Site Title' ) }</FormLabel>
					<FormTextInput name="blogname" value={ this.props.blogname } onChange={ this.onChangeSiteTitle } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="blogdescription">{ this.props.translate( 'Tagline' ) }</FormLabel>
					<FormTextInput name="blogdescription"
						value={ this.props.blogdescription }
						onChange={ this.onChangeDescription }
					/>
				</FormFieldset>
			</div>
		);
	}
} );

export default localize( SiteTitleControl );
