/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

const SiteTitleControl = React.createClass( {
	propTypes: {
		blogname: React.PropTypes.string,
		blogdescription: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			blogname: '',
			blogdescription: '',
		}
	},

	getInitialState() {
		const { blogname, blogdescription } = this.props;
		return {
			blogname,
			blogdescription,
		};
	},

	onChangeSiteTitle( event ) {
		const blogdescription = this.state.blogdescription;
		const blogname = event.target.value;
		// Update our UI
		this.setState( { blogname } );
		// Update the state
		this.props.onChange( { blogname, blogdescription } );
	},

	onChangeDescription( event ) {
		const blogname = this.state.blogname;
		const blogdescription = event.target.value;
		// Update our UI
		this.setState( { blogdescription } );
		// Update the state
		this.props.onChange( { blogname, blogdescription } );
	},

	render() {
		return (
			<div className="design-menu-controls__control design-menu-controls__site-title-control">
				<FormFieldset>
					<FormLabel htmlFor="blogname">{ this.translate( 'Site Title' ) }</FormLabel>
					<FormTextInput id="blogname" name="blogname" value={ this.state.blogname } onChange={ this.onChangeSiteTitle } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="blogdescription">{ this.translate( 'Tagline' ) }</FormLabel>
					<FormTextInput id="blogdescription" name="blogdescription" value={ this.state.blogdescription } onChange={ this.onChangeDescription } />
				</FormFieldset>
			</div>
		);
	}
} );

export default SiteTitleControl;
