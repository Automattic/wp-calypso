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
import { errorNotice } from 'state/notices/actions';
import Dialog from 'components/dialog';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormClickToEditInput from 'woocommerce/components/form-click-to-edit-input';

import {
	getCurrentlyOpenShippingClass,
	isCurrentlyOpenShippingClassNew,
	getUsedShippingClassProps,
} from 'woocommerce/state/ui/shipping/classes/selectors';
import {
	closeShippingClass,
	updateShippingClassSetting,
	saveCurrentlyOpenShippingClass,
	removeShippingClass,
} from 'woocommerce/state/ui/shipping/classes/actions';

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
					<h3 className="shipping__class-dialog-heading">
						{ isNew ? translate( 'Add shipping class' ) : translate( 'Edit shipping class' ) }
					</h3>
				</div>

				<FormFieldSet className="shipping__class-dialog-name">
					<FormLabel>{ translate( 'Name' ) }</FormLabel>
					<FormTextInput type="text" name="name" value={ data.name } onChange={ this.onChange } />
				</FormFieldSet>

				<FormFieldSet className="shipping__class-dialog-slug">
					<FormLabel>{ translate( 'Slug' ) + ': ' }</FormLabel>
					<FormClickToEditInput
						onChange={ this.onSlugChange }
						value={ this.getSlugToDisplay() }
						placeholder="-"
						editAriaLabel={ translate( 'Edit slug' ) }
						updateAriaLabel={ translate( 'Update slug' ) }
					/>
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

	getSlugToDisplay() {
		const { name, slug } = this.props.data;

		return slug.length ? slug : name.toLowerCase().replace( /\s+/g, '-' );
	}

	onChange = ( { target: { name, value } } ) => {
		const { siteId, updateFieldValue } = this.props;

		updateFieldValue( siteId, name, value );
	};

	onSlugChange = value => {
		const { siteId, updateFieldValue } = this.props;

		updateFieldValue( siteId, 'slug', value );
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
		const {
			existingSlugs,
			siteId,
			translate,
			data: { id, name, slug },
			updateFieldValue,
			save,
		} = this.props;

		const slugToUse = this.getSlugToDisplay();

		// Check if the slug is free
		if ( -1 !== existingSlugs.indexOf( slugToUse ) ) {
			const text = translate(
				'There was a problem saving %(name)s. A shipping class with this slug already exists.',
				{
					args: { name },
				}
			);

			return this.props.errorNotice( text, {
				id: `shipping-class-error-${ id }`,
			} );
		}

		// If there is no slug, use the generated one
		if ( 0 === slug.trim().length ) {
			updateFieldValue( siteId, 'slug', slugToUse );
		}

		save( siteId );
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
			existingSlugs: getUsedShippingClassProps( state, 'slug', data.id, siteId ),
		};
	},
	dispatch =>
		bindActionCreators(
			{
				close: closeShippingClass,
				updateFieldValue: updateShippingClassSetting,
				deleteClass: removeShippingClass,
				save: saveCurrentlyOpenShippingClass,
				errorNotice,
			},
			dispatch
		)
)( localize( ShippingClassDialog ) );
