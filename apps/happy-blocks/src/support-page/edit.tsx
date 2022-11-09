import './edit.scss';
import { BlockControls, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { ToolbarButton, ToolbarGroup, withNotices } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { edit } from '@wordpress/icons';
import React from 'react';
import { fetchPageAttributes, SUPPORT_PAGE_PATTERN, SupportPageBlockAttributes } from './block';
import { EmbedPlaceHolder } from './embed-placeholder';
import { WordPressIcon } from './icon';
import { SupportPageEmbed } from './support-page-embed';

type EditProps = BlockEditProps< SupportPageBlockAttributes > &
	withNotices.Props & {
		noticeUI: JSX.Element;
	};

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 * @returns {import("@wordpress/element").WPElement} Element to render.
 */
export const Edit = compose( withNotices )( ( props: EditProps ) => {
	const { attributes, className, setAttributes, noticeOperations, noticeUI } = props;

	const instructions = __( 'Paste a link to the page you want to display.', 'happy-blocks' );
	const mismatchErrorMessage = __( 'It does not look like an embeddable URL.', 'happy-blocks' );
	const placeholder = __( 'Enter URL to embed here…', 'happy-blocks' );
	const label = __( 'WordPress Guide page URL', 'happy-blocks' );

	const [ editing, setEditing ] = useState( false );
	const [ url, setUrl ] = useState( attributes.url );

	const onEditModeToggle = () => {
		setEditing( ! editing );
	};

	const onSubmit = async () => {
		if ( ! SUPPORT_PAGE_PATTERN.test( url ) ) {
			noticeOperations.removeAllNotices();
			noticeOperations.createErrorNotice( mismatchErrorMessage );
			return;
		}

		try {
			const fetchedAttributes = await fetchPageAttributes( url );

			noticeOperations.removeAllNotices();
			setEditing( false );

			setAttributes( fetchedAttributes );
		} catch ( e: any ) {
			noticeOperations.removeAllNotices();
			noticeOperations.createErrorNotice( e.message || e || 'Unable to fetch the page, check URL' );
		}
	};

	const blockProps = useBlockProps( {
		className: 'wp-block-p2-embed',
	} );

	return (
		<div { ...blockProps }>
			<BlockControls>
				<ToolbarGroup>
					{ ! editing && (
						<ToolbarButton
							icon={ edit }
							label={ __( 'Edit URL', 'happy-blocks' ) }
							isActive={ editing }
							onClick={ onEditModeToggle }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>
			{ editing || ! attributes.url ? (
				<EmbedPlaceHolder
					className={ className }
					icon={ <WordPressIcon variant="small" /> }
					instructions={ instructions }
					label={ label }
					url={ url }
					notices={ noticeUI }
					placeholder={ placeholder }
					onSubmit={ onSubmit }
					updateUrl={ setUrl }
				/>
			) : (
				<SupportPageEmbed attributes={ attributes } />
			) }
		</div>
	);
} ) as React.ComponentType< BlockEditProps< SupportPageBlockAttributes > >;
