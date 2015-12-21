// External dependencies
import React from 'react';
import debugModule from 'debug';

// Internal dependencies
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
//import FormInputValidation from 'components/forms/form-input-validation';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import ReaderListsActions from 'lib/reader-lists/actions';

const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementDescriptionEdit = React.createClass( {

	mixins: [ React.addons.LinkedStateMixin ],

	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	getInitialState() {
		return {
			title: '',
			description: '',
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.list ) {
			this.setState( {
				title: nextProps.list.title,
				description: nextProps.list.description
			} );
		}
	},

	handleFormSubmit() {
		ReaderListsActions.update(
			this.props.list.owner,
			this.props.list.slug,
			this.state.title,
			this.state.description
		);
	},

	render() {
		if ( ! this.props.list ) {
			return null;
		}

		return (
			<Card>
				<FormFieldset>
					<FormLabel htmlFor="list-title">Title</FormLabel>
					<FormTextInput
						autoCapitalize="off"
						autoComplete="on"
						autoCorrect="off"
						id="list-title"
						name="list-title"
						ref="listTitle"
						//className="is-error"
						placeholder=""
						valueLink={ this.linkState( 'title' ) } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="list-description">Description</FormLabel>
					<FormTextarea
						ref="listDescription"
						name="list-description"
						id="list-description"
						placeholder=""
						valueLink={ this.linkState( 'description' ) }></FormTextarea>
				</FormFieldset>

				<FormButtonsBar>
					<FormButton onClick={ this.handleFormSubmit }>{ this.translate( 'Save Changes' ) }</FormButton>
				</FormButtonsBar>
			</Card>
		);
	}
} );

export default ListManagementDescriptionEdit;
