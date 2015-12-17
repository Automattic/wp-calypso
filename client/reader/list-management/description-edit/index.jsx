// External dependencies
import React from 'react';
import ReactDom from 'react-dom';
import debugModule from 'debug';

// Internal dependencies
import Main from 'components/main';
import Navigation from 'reader/list-management/navigation';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import ReaderListsActions from 'lib/reader-lists/actions';

const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementDescriptionEdit = React.createClass( {
	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	handleFormSubmit() {
		debug( 'handleFormSubmit' );

		ReaderListsActions.update(
			this.props.list.owner,
			this.props.list.slug,
			ReactDom.findDOMNode( this.refs.listTitle ).value,
			ReactDom.findDOMNode( this.refs.listDescription ).value
		);
	},

	render() {
		return (
			<Main className="list-management-description-edit">
				<Navigation selected="description-edit" list={ this.props.list } />
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
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="list-description">Description</FormLabel>
						<FormTextarea ref="listDescription" name="list-description" id="list-description" placeholder=""></FormTextarea>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton onClick={ this.handleFormSubmit }>{ this.translate( 'Save Changes' ) }</FormButton>
					</FormButtonsBar>
				</Card>
			</Main>
			);
	}
} );

export default ListManagementDescriptionEdit;
