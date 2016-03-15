/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

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
			<div className="tailor-controls__control tailor-controls__site-title-control">
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

function mapStateToProps( state ) {
	const { ui, tailor } = state;
	const siteId = ui.selectedSiteId;
	const selectedSite = state.sites.items[ siteId ] || {};
	if ( tailor.customizations.siteTitle ) {
		return tailor.customizations.siteTitle;
	}
	return { blogname: selectedSite.title, blogdescription: selectedSite.description };
}

export default connect( mapStateToProps )( SiteTitleControl );
