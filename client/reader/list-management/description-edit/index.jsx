// External dependencies
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import debugModule from 'debug';

// Internal dependencies
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import ReaderListsActions from 'lib/reader-lists/actions';
import ReaderListsStore from 'lib/reader-lists/lists';
import smartSetState from 'lib/react-smart-set-state';
import Notice from 'components/notice';

const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementDescriptionEdit = React.createClass( {

	mixins: [ LinkedStateMixin ],
	smartSetState: smartSetState,

	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	getInitialState() {
		return Object.assign( {
			title: '',
			description: '',
		}, this.getStateFromStores( this.props ) );
	},

	getStateFromStores( props ) {
		const list = props.list;
		const currentState = {};
		if ( list && list.ID ) {
			currentState.ID = list.ID;
			currentState.title = list.title,
			currentState.description = list.description;
			currentState.lastListError = ReaderListsStore.getLastError(),
			currentState.isUpdated = ReaderListsStore.isUpdated( list.ID );
		}
		return currentState;
	},

	componentWillReceiveProps( nextProps ) {
		this.smartSetState( this.getStateFromStores( nextProps ) );
	},

	componentWillUnmount() {
		this.handleDismissNotice();
	},

	handleFormSubmit() {
		ReaderListsActions.dismissNotice(
			this.props.list.ID
		);

		const params = {
			ID: this.props.list.ID,
			owner: this.props.list.owner,
			slug: this.props.list.slug,
			title: this.state.title,
			description: this.state.description
		};

		ReaderListsActions.update( params );
	},

	handleDismissNotice() {
		ReaderListsActions.dismissNotice(
			this.props.list.ID
		);
	},

	render() {
		if ( ! this.props.list ) {
			return null;
		}

		let notice = null;
		if ( this.state.isUpdated ) {
			notice = <Notice status="is-success" text={ this.translate( 'List details saved successfully.' ) } onDismissClick={ this.handleDismissNotice } />;
		}

		const isTitleMissing = ! this.state.title || this.state.title.length < 1;

		return (
			<div className="list-management-description-edit">
				{ notice }
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
							required
							className={ isTitleMissing ? 'is-error' : '' }
							placeholder=""
							valueLink={ this.linkState( 'title' ) } />
						{ isTitleMissing ? <FormInputValidation isError text={ this.translate( 'Title is a required field.' ) } /> : '' }
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
						<FormButton disabled={ isTitleMissing } onClick={ this.handleFormSubmit }>{ this.translate( 'Save Changes' ) }</FormButton>
					</FormButtonsBar>
				</Card>
			</div>
		);
	}
} );

export default ListManagementDescriptionEdit;
