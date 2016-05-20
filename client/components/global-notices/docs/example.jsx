/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import DocsExample from 'components/docs-example';
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
			useState: event.target.checked
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

	render() {
		return (
			<DocsExample
				title="Global Notices"
				url="/devdocs/design/global-notices"
				componentUsageStats={ this.props.getUsageStats( notices ) }
			>
				<label>
					<FormCheckbox
						onChange={ this.toggleUseState }
						checked={ this.state.useState } />
					Use global application state
				</label>
				<ButtonGroup>
					<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
					<Button onClick={ this.showErrorNotice }>Show error notice</Button>
					<Button onClick={ this.showInfoNotice }>Show info notice</Button>
					<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
				</ButtonGroup>
			</DocsExample>
		);
	}
}

GlobalNotices.propTypes = {
	createNotice: PropTypes.func
};

const ConnectedGlobalNotices = connect( null, { createNotice } )( GlobalNotices );
ConnectedGlobalNotices.displayName = 'GlobalNotices';
export default ConnectedGlobalNotices;
