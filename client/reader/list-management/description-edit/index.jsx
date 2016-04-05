// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
import Notice from 'components/notice';
import { updateListDetails, dismissListNotice, updateTitle, updateDescription } from 'state/reader/lists/actions';
import { isUpdatedList, hasError } from 'state/reader/lists/selectors';

const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementDescriptionEdit = React.createClass( {

	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.list.ID !== this.props.list.ID ) {
			this.handleDismissNotice();
		}
	},

	componentWillUnmount() {
		this.handleDismissNotice();
	},

	handleFormSubmit() {
		this.handleDismissNotice();
		this.props.updateListDetails( this.props.list );
	},

	handleDismissNotice() {
		this.props.dismissListNotice( this.props.list.ID );
	},

	onTitleChange( event ) {
		this.props.updateTitle( this.props.list.ID, event.target.value );
	},

	onDescriptionChange( event ) {
		this.props.updateDescription( this.props.list.ID, event.target.value );
	},

	render() {
		if ( ! this.props.list ) {
			return null;
		}

		let notice = null;
		if ( this.props.isUpdatedList ) {
			notice = <Notice status="is-success" text={ this.translate( 'List details saved successfully.' ) } onDismissClick={ this.handleDismissNotice } />;
		}

		if ( this.props.hasError ) {
			notice = <Notice status="is-error" text={ this.translate( 'Sorry, there was a problem saving your list details.' ) } onDismissClick={ this.handleDismissNotice } />;
		}

		const isTitleMissing = ! this.props.list.title || this.props.list.title.length < 1;

		debug( this.props );

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
							onChange={ this.onTitleChange }
							value={ this.props.list ? this.props.list.title : '' } />
						{ isTitleMissing ? <FormInputValidation isError text={ this.translate( 'Title is a required field.' ) } /> : '' }
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="list-description">Description</FormLabel>
						<FormTextarea
							ref="listDescription"
							name="list-description"
							id="list-description"
							placeholder=""
							onChange={ this.onDescriptionChange }
							value={ this.props.list ? this.props.list.description : '' }></FormTextarea>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton disabled={ isTitleMissing } onClick={ this.handleFormSubmit }>{ this.translate( 'Save Changes' ) }</FormButton>
					</FormButtonsBar>
				</Card>
			</div>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		return {
			isUpdatedList: isUpdatedList( state, ownProps.list.ID ),
			hasError: hasError( state, ownProps.list.ID )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			updateListDetails,
			dismissListNotice,
			updateTitle,
			updateDescription
		}, dispatch );
	}
)( ListManagementDescriptionEdit );
