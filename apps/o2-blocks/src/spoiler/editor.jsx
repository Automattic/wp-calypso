/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/editor';

const blockAttributes = {
	summary: {
		type: 'string',
		source: 'html',
		selector: 'summary',
	},
};

const save = ( { attributes: { summary } }, className ) => {
	return (
		<details className={ className }>
			<RichText.Content tagName="summary" value={ summary || 'Click to show/hide' } />
			<div style={ { marginTop: '1em' } }>
				<InnerBlocks.Content />
			</div>
		</details>
	);
};

const edit = ( { attributes: { summary }, className, isSelected, setAttributes } ) => {
	return (
		<div className={ className }>
			{ isSelected || ! summary ? (
				<RichText
					tagName="heading"
					placeholder="Enter a preview or description of what's hidden inside"
					keepPlaceholderOnFocus={ true }
					value={ summary }
					onChange={ ( newSummary ) => setAttributes( { summary: newSummary } ) }
				/>
			) : (
				<RichText.Content tagName="heading" value={ summary } />
			) }
			<hr />
			<InnerBlocks />
		</div>
	);
};

///////////////////////////////////////
// Deprecations
///////////////////////////////////////

const blockAttributes_v1 = {
	hideId: {
		type: 'string',
	},
	showId: {
		type: 'string',
	},
};

const migrate_v1 = () => ( {} );

const save_v1 = ( { attributes: { hideId, showId }, className } ) => {
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

registerBlockType( 'a8c/spoiler', {
	title: __( 'Spoiler!' ),
	icon: 'warning',
	category: 'a8c',
	description: __( 'Hide content until the reader wants to see it.' ),
	keywords: [ __( 'spoiler' ) ],
	attributes: blockAttributes,
	edit,
	save,
	deprecated: [
		{
			attributes: blockAttributes_v1,
			migrate: migrate_v1,
			save: save_v1,
		},
	],
} );
