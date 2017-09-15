/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import FormSettings from './settings';
import Navigation from './navigation';
import FieldList from './field-list';
import { getCurrentUser } from 'state/current-user/selectors';
import PostEditStore from 'lib/posts/post-edit-store';
import { validateFormFields, validateSettingsToEmail } from './validations';

const ContactFormDialog = React.createClass( {
	displayName: 'ContactFormDialog',

	propTypes: {
		activeTab: PropTypes.oneOf( [ 'fields', 'settings' ] ).isRequired,
		showDialog: PropTypes.bool.isRequired,
		isEdit: PropTypes.bool.isRequired,
		contactForm: PropTypes.shape( {
			to: PropTypes.string,
			subject: PropTypes.string,
			fields: PropTypes.array.isRequired
		} ).isRequired,
		onInsert: PropTypes.func.isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onFieldAdd: PropTypes.func.isRequired,
		onFieldRemove: PropTypes.func.isRequired,
		onFieldUpdate: PropTypes.func.isRequired,
		onSettingsUpdate: PropTypes.func.isRequired
	},

	getActionButtons() {
		const isValidForm = validateFormFields( this.props.contactForm.fields ) && validateSettingsToEmail( this.props.contactForm.to );
		const actionButtons = [
			<FormButton
				key="save"
				data-e2e-button="save"
				disabled={ ! isValidForm }
				onClick={ this.props.onInsert } >
				{ this.props.isEdit ? this.translate( 'Update' ) : this.translate( 'Insert' ) }
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				data-e2e-button="cancel"
				onClick={ this.props.onClose } >
				{ this.translate( 'Cancel' ) }
			</FormButton>
		];

		if ( this.props.activeTab === 'fields' ) {
			return [
				<div key="secondaryActions" className="editor-contact-form-modal__secondary-actions">
					<FormButton
						key="add"
						isPrimary={ false }
						data-e2e-button="add"
						onClick={ this.props.onFieldAdd } >
						{ this.translate( 'Add New Field' ) }
					</FormButton>
				</div>,
				...actionButtons
			];
		}

		return actionButtons;
	},

	render() {
		const {
			activeTab,
			currentUser: { email },
			post: { title, type: postType },
			contactForm: { to, subject, fields },
			showDialog,
			onChangeTabs,
			onClose,
			onFieldAdd,
			onFieldUpdate,
			onFieldRemove,
			onSettingsUpdate
		} = this.props;

		const content = activeTab === 'fields'
			? <FieldList { ...{ fields, onFieldAdd, onFieldRemove, onFieldUpdate } } />
			: <FormSettings { ...{ to, subject, email, title, postType, onUpdate: onSettingsUpdate } } />;

		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ this.getActionButtons() }
				additionalClassNames="editor-contact-form-modal" >
				<Navigation { ...{ activeTab, onChangeTabs, fieldCount: fields.length } } />
				{ content }
			</Dialog>
		);
	}
} );

export default connect( state => {
	return {
		post: PostEditStore.get() || {},
		currentUser: getCurrentUser( state ),
		contactForm: state.ui.editor.contactForm
	};
} )( ContactFormDialog );
