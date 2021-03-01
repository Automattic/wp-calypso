/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ButtonGroup from 'calypso/components/button-group';
import { Button } from '@automattic/components';
import { createNotice } from 'calypso/state/notices/actions';

class GlobalNotices extends Component {
	constructor() {
		super( ...arguments );

		this.showSuccessNotice = this.showNotice.bind( this, 'success' );
		this.showErrorNotice = this.showNotice.bind( this, 'error' );
		this.showInfoNotice = this.showNotice.bind( this, 'info' );
		this.showWarningNotice = this.showNotice.bind( this, 'warning' );
	}

	showNotice( type ) {
		this.props.createNotice( `is-${ type }`, `This is a ${ type } notice` );
	}

	render() {
		return (
			<div>
				<ButtonGroup>
					<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
					<Button onClick={ this.showErrorNotice }>Show error notice</Button>
					<Button onClick={ this.showInfoNotice }>Show info notice</Button>
					<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
				</ButtonGroup>
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
