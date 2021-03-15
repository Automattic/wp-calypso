/**
 * External dependencies
 */
import React from 'react';
import AsyncLoad from 'calypso/components/async-load';

const PostCommentFormTextarea = ( props ) => <AsyncLoad require="./block-editor" { ...props } />;

export default PostCommentFormTextarea;
