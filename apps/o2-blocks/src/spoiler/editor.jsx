/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

/**
 * @cite https://jsfiddle.net/clarle/bY7m4/
 */

const blockAttributes = {
	hideId: {
		type: 'string',
	},
	showId: {
		type: 'string',
	},
};

const save = ( { attributes: { hideId, showId }, className } ) => {
	return (
		<div className={ className }>
			<a
				href={ `#spoiler_block_hide_${ hideId }` }
				className="hide btn"
				id={ `spoiler_block_hide_${ hideId }` }
			>
				Reveal hidden content
			</a>
			<a
				href={ `#spoiler_block_show_${ showId }` }
				className="show btn"
				id={ `spoiler_block_show_${ showId }` }
			>
				Hide content
			</a>
			<div className="spoiler">
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

const randomId = () => `${ Math.floor( Math.random() * 999999999999 ) }`;

const edit = ( { attributes: { hideId, showId }, className, setAttributes } ) => {
	if ( ! hideId || ! showId ) {
		setAttributes( {
			hideId: randomId(),
			showId: randomId(),
		} );
	}
	return (
		<div className={ className }>
			<p>Spoiler content (hidden on page view)</p>
			<InnerBlocks />
		</div>
	);
};

registerBlockType( 'a8c/spoiler', {
	title: __( 'Spoiler!' ),
	icon: 'warning',
	category: 'a8c',
	description: __( 'Hide content until the reader wants to see it.' ),
	keywords: [ __( 'spoiler' ) ],
	attributes: blockAttributes,
	edit,
	save,
} );
