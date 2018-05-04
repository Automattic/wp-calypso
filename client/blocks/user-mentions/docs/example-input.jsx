/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ExampleInput from './example-input';
import withUserMentions from '../with-user-mentions';

// @todo Move ref forwarding to the HOC
const UserMentionsExampleInput = React.forwardRef( ( props, ref ) => (
	<textarea ref={ ref } onKeyUp={ props.onKeyUp } onKeyDown={ props.onKeyDown } />
) );

export default withUserMentions( UserMentionsExampleInput );
