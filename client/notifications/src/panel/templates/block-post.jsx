import React from 'react';

import { html } from '../indices-to-html';
import { p } from './functions';

const PostBlock = ( { block } ) => <div className="wpnc__post">{ p( html( block ) ) }</div>;

export default PostBlock;
