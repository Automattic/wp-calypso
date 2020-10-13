/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * Exernal dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { html } from '../indices-to-html';
import { p } from './functions';

const PostBlock = ( { block, postUrl } ) => (
	<div className="wpnc__post">{ p( html( block, { sourceUrl: postUrl } ) ) }</div>
);

export default PostBlock;
