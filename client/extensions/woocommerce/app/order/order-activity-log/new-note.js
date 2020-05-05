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
import { Button, ScreenReaderText } from '@automattic/components';
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormSelect from 'components/forms/form-select';
import { isOrderNoteSaving } from 'woocommerce/state/sites/orders/notes/selectors';

class CreateOrderNote extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	state = {
		note: '',
		type: 'internal',
	};

	setNote = ( event ) => {
		this.setState( {
			note: event.target.value,
		} );
	};

	setType = ( event ) => {
		this.setState( {
			type: event.target.value,
		} );
	};

	saveNote = () => {
		const { orderId, siteId } = this.props;
		if ( ! this.state.note ) {
			return;
		}
		const note = {
			note: this.state.note,
			customer_note: 'email' === this.state.type,
		};
		this.props.createNote( siteId, orderId, note );
		this.setState( { note: '' } );
	};

	render() {
		const { isNoteSaving, translate } = this.props;

		return (
			<div className="order-activity-log__new-note">
				<FormFieldSet className="order-activity-log__new-note-content">
					<ScreenReaderText>
						<FormLabel htmlFor="note">{ translate( 'Add a note' ) }</FormLabel>
					</ScreenReaderText>
					<FormTextarea
						id="note"
						value={ this.state.note }
						onChange={ this.setNote }
						placeholder={ translate( 'Add a note' ) }
					/>
				</FormFieldSet>
				<div className="order-activity-log__new-note-type">
					<FormSelect onChange={ this.setType } value={ this.state.type }>
						<option value={ 'internal' }>{ translate( 'Private note' ) }</option>
						<option value={ 'email' }>{ translate( 'Send to customer' ) }</option>
					</FormSelect>
					<Button primary onClick={ this.saveNote } busy={ isNoteSaving } disabled={ isNoteSaving }>
						{ translate( 'Add note' ) }
					</Button>
				</div>
			</div>
		);
	}
}

export default connect(
	( state, props ) => ( {
		isNoteSaving: isOrderNoteSaving( state, props.orderId ),
	} ),
	( dispatch ) => bindActionCreators( { createNote }, dispatch )
)( localize( CreateOrderNote ) );
