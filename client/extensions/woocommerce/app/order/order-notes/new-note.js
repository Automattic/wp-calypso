/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';
import Button from 'components/button';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormSelect from 'components/forms/form-select';

class CreateOrderNote extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	}

	state = {
		note: '',
		type: 'internal',
	}

	setNote = ( event ) => {
		this.setState( {
			note: event.target.value,
		} );
	}

	setType = ( event ) => {
		this.setState( {
			type: event.target.value,
		} );
	}

	saveNote = () => {
		const { orderId, siteId } = this.props;
		const note = {
			note: this.state.note,
			customer_note: 'email' === this.state.type,
		};
		this.props.createNote( siteId, orderId, note );
		this.setState( { note: '' } );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="order-notes__new-note">
				<FormFieldSet className="order-notes__new-note-content">
					<FormLabel htmlFor="note">{ translate( 'Add a note' ) }</FormLabel>
					<FormTextarea
						id="note"
						value={ this.state.note }
						onChange={ this.setNote }
					/>
				</FormFieldSet>
				<FormFieldSet className="order-notes__new-note-type">
					<FormSelect onChange={ this.setType } value={ this.state.type }>
						<option value={ 'internal' }>{ translate( 'Private Note' ) }</option>
						<option value={ 'email' }>{ translate( 'Send to Customer' ) }</option>
					</FormSelect>
				</FormFieldSet>
				<Button primary onClick={ this.saveNote }>{ translate( 'Add Note' ) }</Button>
			</div>
		);
	}
}

export default connect(
	undefined,
	dispatch => bindActionCreators( { createNote }, dispatch )
)( localize( CreateOrderNote ) );
