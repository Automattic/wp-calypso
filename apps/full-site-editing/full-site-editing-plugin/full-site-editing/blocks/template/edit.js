/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/* global fullSiteEditing */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { parse, createBlock } from '@wordpress/blocks';
import { BlockEdit } from '@wordpress/editor';
import { Button, Placeholder, Spinner, Disabled } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { Fragment, useEffect, useState, createRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';

const TemplateEdit = compose(
	withState( { templateClientId: null } ),
	withSelect( ( select, { attributes, templateClientId } ) => {
		const { getEntityRecord } = select( 'core' );
		const { getCurrentPostId, isEditedPostDirty } = select( 'core/editor' );
		const { getBlock, getSelectedBlock } = select( 'core/block-editor' );
		const { isEditorSidebarOpened } = select( 'core/edit-post' );
		const { templateId } = attributes;
		const currentPostId = getCurrentPostId();
		const template = templateId && getEntityRecord( 'postType', 'wp_template', templateId );
		const editTemplateUrl = addQueryArgs( fullSiteEditing.editTemplateBaseUrl, {
			post: templateId,
			fse_parent_post: currentPostId,
		} );
		const selectedBlock = getSelectedBlock();

		return {
			currentPostId,
			editTemplateUrl,
			template,
			templateBlock: getBlock( templateClientId ),
			templateTitle: get( template, [ 'title', 'rendered' ], '' ),
			isDirty: isEditedPostDirty(),
			isEditorSidebarOpened: !! isEditorSidebarOpened(),
			isAnyTemplateBlockSelected: selectedBlock && 'a8c/template' === selectedBlock.name,
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const { receiveBlocks } = dispatch( 'core/block-editor' );
		const { openGeneralSidebar } = dispatch( 'core/edit-post' );
		const { template, templateClientId, setState } = ownProps;
		return {
			savePost: dispatch( 'core/editor' ).savePost,
			receiveTemplateBlocks: () => {
				if ( ! template || templateClientId ) {
					return;
				}

				const templateBlocks = parse( get( template, [ 'content', 'raw' ], '' ) );
				const templateBlock = createBlock( 'core/group', {}, templateBlocks );

				receiveBlocks( [ templateBlock ] );
				setState( { templateClientId: templateBlock.clientId } );
			},
			openGeneralSidebar,
		};
	} )
)(
	( {
		attributes,
		editTemplateUrl,
		receiveTemplateBlocks,
		template,
		templateBlock,
		templateTitle,
		isDirty,
		savePost,
		isEditorSidebarOpened,
		openGeneralSidebar,
		isAnyTemplateBlockSelected,
	} ) => {
		if ( ! template ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			);
		}
		const navButton = createRef();
		const [ navigateToTemplate, setNavigateToTemplate ] = useState( false );
		useEffect( () => {
			if ( navigateToTemplate && ! isDirty ) {
				// Since we cancelled the click event to save the post
				// we trigger it again here. We do this instead of setting
				// window.location.href because in WordPress.com, the navigation
				// scheme is different and not available to us here.
				navButton.current.click();
			}
			receiveTemplateBlocks();
		} );

		useEffect( () => {
			// Since the Block Sidebar (`edit-post/block`) is not available for the Template block,
			// if the sidebar is open, we force toggle to the Document Sidebar, and hide the Block button.
			const blockSidebarButton = document.querySelector(
				'.edit-post-sidebar__panel-tabs ul li:last-child'
			);
			if ( isEditorSidebarOpened && blockSidebarButton ) {
				if ( isAnyTemplateBlockSelected ) {
					openGeneralSidebar( 'edit-post/document' );
					blockSidebarButton.classList.add( 'hidden' );
					return;
				}
				blockSidebarButton.classList.remove( 'hidden' );
			}
		}, [ isAnyTemplateBlockSelected, isEditorSidebarOpened, openGeneralSidebar ] );

		const { align, className } = attributes;

		const save = event => {
			setNavigateToTemplate( true );
			if ( ! isDirty ) {
				return;
			}
			event.preventDefault();
			savePost();
		};

		return (
			<div
				className={ classNames( 'template-block', {
					[ `align${ align }` ]: align,
					'is-navigating-to-template': navigateToTemplate,
				} ) }
			>
				{ templateBlock && (
					<Fragment>
						<Disabled>
							<div className={ className }>
								<BlockEdit
									attributes={ templateBlock.attributes }
									block={ templateBlock }
									clientId={ templateBlock.clientId }
									isSelected={ false }
									name={ templateBlock.name }
									setAttributes={ noop }
								/>
							</div>
						</Disabled>
						<Placeholder className="template-block__overlay">
							{ navigateToTemplate && (
								<div className="template-block__loading">
									<Spinner /> { sprintf( __( 'Loading %s Editor' ), templateTitle ) }
								</div>
							) }
							<Button
								className={ navigateToTemplate ? 'hidden' : null }
								href={ editTemplateUrl }
								onClick={ save }
								isDefault
								isLarge
								ref={ navButton }
							>
								{ sprintf( __( 'Edit %s' ), templateTitle ) }
							</Button>
						</Placeholder>
					</Fragment>
				) }
			</div>
		);
	}
);

export default TemplateEdit;
