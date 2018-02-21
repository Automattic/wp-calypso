/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import { protectForm } from 'lib/protect-form';
import formBase from 'me/form-base';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';

// NOTE: disabling it since we need to use the `formBase` mixin
// eslint-disable-next-line react/prefer-es6-class
const Privacy = createReactClass( {
	displayName: 'Privacy',

	mixins: [ formBase ],

	propTypes: {
		userSettings: PropTypes.object.isRequired,
	},

	render() {
		return (
			<Main className="privacy">
				<DocumentHead title={ this.props.translate( 'Privacy Settings' ) } />
				Privacy form incoming
			</Main>
		);
	},
} );

export default compose( localize, protectForm )( Privacy );
