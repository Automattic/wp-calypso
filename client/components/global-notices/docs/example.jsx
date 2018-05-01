/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import FormCheckbox from 'components/forms/form-checkbox';
import notices from 'notices';
import { createNotice } from 'state/notices/actions';

class GlobalNotices extends Component {
	constructor() {
		super( ...arguments );

		this.state = { useState: true };
		this.toggleUseState = this.toggleUseState.bind( this );
		this.showSuccessNotice = this.showNotice.bind( this, 'success' );
		this.showErrorNotice = this.showNotice.bind( this, 'error' );
		this.showInfoNotice = this.showNotice.bind( this, 'info' );
		this.showWarningNotice = this.showNotice.bind( this, 'warning' );
	}

	toggleUseState( event ) {
		this.setState( {
			useState: event.target.checked,
		} );
	}

	showNotice( type ) {
		const message = `This is a ${ type } notice`;
		if ( this.state.useState ) {
			this.props.createNotice( `is-${ type }`, message );
		} else {
			notices[ type ]( message );
		}
	}

	showA11yNotice = () => {
		const message = (
			<span>
				This is a notice with an action in the text, for example
				<a href="#">this is a link.</a>
			</span>
		);
		const spokenMessage = 'This is screen-reader only notice text';
		if ( this.state.useState ) {
			this.props.createNotice( 'is-success', message, { spokenMessage } );
		} else {
			notices[ type ]( message, { spokenMessage } );
		}
	};

	render() {
		return (
			<div>
				<label>
					<FormCheckbox onChange={ this.toggleUseState } checked={ this.state.useState } />
					<span>Use global application state</span>
				</label>
				<ButtonGroup>
					<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
					<Button onClick={ this.showErrorNotice }>Show error notice</Button>
					<Button onClick={ this.showInfoNotice }>Show info notice</Button>
					<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
				</ButtonGroup>

				<hr aria-hidden />
				<p>
					In some cases, we want to use a different string for the visual text & what is announced
					for screen reader users. For example, a notice with an action in the text might be
					disruptive to the screen reader's focus flow. Instead, we can pass a simple string to
					<code>spokenMessage</code>.
				</p>
				<Button onClick={ this.showA11yNotice }>Show accessible notice</Button>
			</div>
		);
	}
}

GlobalNotices.propTypes = {
	createNotice: PropTypes.func,
};

const ConnectedGlobalNotices = connect( null, { createNotice } )( GlobalNotices );
ConnectedGlobalNotices.displayName = 'GlobalNotices';
export default ConnectedGlobalNotices;
