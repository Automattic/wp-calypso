/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import notices from 'notices';

function showSuccessNotice() {
	notices.success( 'This is a global success notice' );
}

function showErrorNotice() {
	notices.error( 'This is a global error notice' );
}

function showInfoNotice() {
	notices.info( 'This is a global info notice' );
}

function showWarningNotice() {
	notices.warning( 'This is a global warning notice' );
}

const GlobalNotices = () => (
	<div>
		<h2>Global Notices</h2>
		<ButtonGroup>
			<Button onClick={ showSuccessNotice }>Show success notice</Button>
			<Button onClick={ showErrorNotice }>Show error notice</Button>
			<Button onClick={ showInfoNotice }>Show info notice</Button>
			<Button onClick={ showWarningNotice }>Show warning notice</Button>
		</ButtonGroup>
	</div>
);
GlobalNotices.displayName = 'GlobalNotices';

module.exports = GlobalNotices;
