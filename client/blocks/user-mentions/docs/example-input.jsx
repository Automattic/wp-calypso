/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExampleInput from './example-input';
import withUserMentions from '../with-user-mentions';

const UserMentionsExampleInput = ( { onKeyPress } ) => <textarea onKeyPress={ onKeyPress } />;

export default withUserMentions( UserMentionsExampleInput );
