/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

import {
	getCurrentlyOpenShippingClass,
	isCurrentlyOpenShippingClassNew,
	getCurrentlyOpenShippingClassSavingArgs,
} from 'woocommerce/state/ui/shipping/classes/selectors';
import {
	closeShippingClass,
	updateShippingClassField,
	saveCurrentlyOpenShippingClass,
} from 'woocommerce/state/ui/shipping/classes/actions';

import { deleteShippingClass } from 'woocommerce/state/sites/shipping-classes/actions';

class ShippingClassDialog extends Component {
	render() {
		const { isNew, data, translate } = this.props;

		if ( null === data ) {
			return null;
		}

		// The modal can only be saved when there is a non-null name
		const canSave = data.name && data.name.trim().length > 0;

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'add',
				label: isNew ? translate( 'Add' ) : translate( 'Done' ),
				onClick: this.onSave,
				isPrimary: true,
				disabled: ! canSave,
			},
		];

		if ( ! isNew ) {
			buttons.unshift( {
				action: 'delete',
				label: (
					<span>
						<Gridicon icon="trash" /> { translate( 'Delete this class' ) }
					</span>
				),
				onClick: this.onDelete,
				additionalClassNames: 'shipping__class-delete is-scary is-borderless',
			} );
		}

		const dialogProps = {
			additionalClassNames: 'shipping__class-dialog woocommerce',
			isVisible: true,
			buttons: buttons,
			onClose: this.onCancel,
		};

		return (
			<Dialog { ...dialogProps }>
				<div className="shipping__class-dialog-header">
					{ isNew ? translate( 'Add shipping class' ) : translate( 'Edit shipping class' ) }
				</div>

				<FormFieldSet>
					<FormLabel>{ translate( 'Name' ) }</FormLabel>
					<FormTextInput type="text" name="name" value={ data.name } onChange={ this.onChange } />
				</FormFieldSet>

				<FormFieldSet>
					<FormLabel>{ translate( 'Slug' ) }</FormLabel>
					<FormTextInput type="text" name="slug" value={ data.slug } onChange={ this.onChange } />
				</FormFieldSet>

				<FormFieldSet>
					<FormLabel>{ translate( 'Description' ) }</FormLabel>
					<FormTextInput
						type="text"
						name="description"
						value={ data.description }
						onChange={ this.onChange }
					/>
				</FormFieldSet>
			</Dialog>
		);
	}

	onChange = ( { target: { name, value } } ) => {
		const { siteId, updateField } = this.props;

		updateField( siteId, name, value );
	};

	onCancel = () => {
		const { close, siteId } = this.props;

		close( siteId );
	};

	onDelete = () => {
		const {
			data: { id },
			siteId,
			deleteClass,
		} = this.props;

		deleteClass( siteId, id );
	};

	onSave = () => {
		const { savingArgs, siteId, save } = this.props;

		if ( savingArgs ) {
			save( siteId, savingArgs );
		} else {
			this.onCancel();
		}
	};
}

export default connect(
	( state, { siteId } ) => {
		const data = getCurrentlyOpenShippingClass( state, siteId );

		// If nothing  is being edited, it is pointless to load anything else
		if ( null === data ) {
			return { data };
		}

		return {
			siteId,
			data,
			isNew: isCurrentlyOpenShippingClassNew( state, siteId ),
			savingArgs: getCurrentlyOpenShippingClassSavingArgs( state, siteId ),
		};
	},
	dispatch =>
		bindActionCreators(
			{
				close: closeShippingClass,
				updateField: updateShippingClassField,
				deleteClass: deleteShippingClass,
				save: saveCurrentlyOpenShippingClass,
			},
			dispatch
		)
)( localize( ShippingClassDialog ) );
