/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { BlockEdit } from '@wordpress/editor';
import { createBlock } from '@wordpress/blocks';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ListEnd from 'components/list-end';
import { generateExample } from '../gutenberg-blocks/example';

export const GutenbergAutomatticBlockExample = ( { name, attributes, inner } ) => {
	const block = createBlock( name, attributes );
	return (
		<React.Fragment>
			<BlockEdit
				name={ name }
				focus={ false }
				attributes={ block.attributes }
				setAttributes={ noop }
			/>
			<ListEnd />
			{ generateExample( { name, attributes, inner } ) }
		</React.Fragment>
	);
};
