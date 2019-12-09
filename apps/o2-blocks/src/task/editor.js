/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, InspectorControls } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { TextControl, PanelBody } from '@wordpress/components';

import './editor.scss';

const edit = ( { attributes, setAttributes, mergeBlocks, onReplace, className } ) => {
	const { assignedTo, checked, content, placeholder } = attributes;
	const todoClass = classnames( 'wp-block-todo', className, { 'is-checked': checked } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Task Assignment' ) }>
					<TextControl
						label={ __( 'Username' ) }
						value={ assignedTo || '' }
						onChange={ value => setAttributes( { assignedTo: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div className={ todoClass }>
				<span
					className="wp-block-todo__status"
					onClick={ () => setAttributes( { checked: ! checked } ) }
					onKeyDown={ () => {} }
					aria-checked={ checked }
					tabIndex="0"
					role="checkbox"
				/>
				<RichText
					identifier="content"
					wrapperClassName="wp-block-todo__text"
					value={ content }
					onChange={ value => setAttributes( { content: value } ) }
					onMerge={ mergeBlocks }
					onSplit={ value => {
						if ( ! content.length ) {
							return createBlock( 'core/paragraph' );
						}

						if ( ! value ) {
							return createBlock( 'jetpack/task' );
						}

						return createBlock( 'jetpack/task', {
							...attributes,
							content: value,
						} );
					} }
					onReplace={ onReplace }
					onRemove={ onReplace ? () => onReplace( [] ) : undefined }
					className={ className }
					placeholder={ placeholder || __( 'Add task…' ) }
				/>
				{ assignedTo && (
					<div className="wp-block-todo__assigned">
						<span>@{ assignedTo }</span>
						<span className="wp-block-todo__avatar">{ assignedTo[ 0 ] }</span>
					</div>
				) }
			</div>
		</>
	);
};

export default edit;
