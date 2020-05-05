/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormSettings from './settings';
import Navigation from './navigation';
import FieldList from './field-list';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { validateFormFields, validateSettingsToEmail } from './validations';

class ContactFormDialog extends React.Component {
	static displayName = 'ContactFormDialog';

	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'fields', 'settings' ] ).isRequired,
		showDialog: PropTypes.bool.isRequired,
		isEdit: PropTypes.bool.isRequired,
		contactForm: PropTypes.shape( {
			to: PropTypes.string,
			subject: PropTypes.string,
			fields: PropTypes.array.isRequired,
		} ).isRequired,
		onInsert: PropTypes.func.isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onFieldAdd: PropTypes.func.isRequired,
		onFieldRemove: PropTypes.func.isRequired,
		onFieldUpdate: PropTypes.func.isRequired,
		onSettingsUpdate: PropTypes.func.isRequired,
	};

	getActionButtons = () => {
		const isValidForm =
			validateFormFields( this.props.contactForm.fields ) &&
			validateSettingsToEmail( this.props.contactForm.to );
		const actionButtons = [
			<FormButton
				key="save"
				data-e2e-button="save"
				disabled={ ! isValidForm }
				onClick={ this.props.onInsert }
			>
				{ this.props.isEdit ? this.props.translate( 'Update' ) : this.props.translate( 'Insert' ) }
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				data-e2e-button="cancel"
				onClick={ this.props.onClose }
			>
				{ this.props.translate( 'Cancel' ) }
			</FormButton>,
		];

		if ( this.props.activeTab === 'fields' ) {
			return [
				<div key="secondaryActions" className="editor-contact-form-modal__secondary-actions">
					<FormButton
						key="add"
						isPrimary={ false }
						data-e2e-button="add"
						onClick={ this.props.onFieldAdd }
					>
						{ this.props.translate( 'Add New Field' ) }
					</FormButton>
				</div>,
				...actionButtons,
			];
		}

		return actionButtons;
	};

	render() {
		const {
			activeTab,
			currentUser: { email },
			post,
			contactForm: { to, subject, fields },
			showDialog,
			onChangeTabs,
			onClose,
			onFieldAdd,
			onFieldUpdate,
			onFieldRemove,
			onSettingsUpdate,
		} = this.props;

		const title = get( post, 'title', null );
		const postType = get( post, 'type', null );

		const content =
			activeTab === 'fields' ? (
				<FieldList { ...{ fields, onFieldAdd, onFieldRemove, onFieldUpdate } } />
			) : (
				<FormSettings { ...{ to, subject, email, title, postType, onUpdate: onSettingsUpdate } } />
			);

		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ this.getActionButtons() }
				additionalClassNames="editor-contact-form-modal"
			>
				<Navigation { ...{ activeTab, onChangeTabs, fieldCount: fields.length } } />
				{ content }
			</Dialog>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );

	return {
		post: getEditedPost( state, siteId, postId ),
		currentUser: getCurrentUser( state ),
		contactForm: state.ui.editor.contactForm,
	};
} )( localize( ContactFormDialog ) );
