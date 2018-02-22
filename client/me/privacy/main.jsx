/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

class Privacy extends Component {
	render() {
		return (
			<Main className="privacy">
				<DocumentHead title={ this.props.translate( 'Privacy Settings' ) } />
				Privacy form incoming
			</Main>
		);
	}
}

export default compose( localize )( Privacy );
