/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ExampleInput from './example-input';
import addUserMentions from '../add';

const UserMentionsExampleInput = React.forwardRef( ( props, ref ) => (
	<textarea ref={ ref } onKeyUp={ props.onKeyUp } onKeyDown={ props.onKeyDown } />
) );

export default addUserMentions( UserMentionsExampleInput );
