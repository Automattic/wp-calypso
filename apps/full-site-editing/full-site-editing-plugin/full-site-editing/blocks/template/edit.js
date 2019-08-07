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
import { Fragment, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';

const TemplateEdit = compose(
	withState( { templateClientId: null, shouldCloseSidebarOnSelect: true } ),
	withSelect( ( select, { attributes, templateClientId } ) => {
		const { getEntityRecord } = select( 'core' );
		const { getCurrentPostId, isEditedPostDirty } = select( 'core/editor' );
		const { getBlock } = select( 'core/block-editor' );
		const { isEditorSidebarOpened } = select( 'core/edit-post' );
		const { templateId } = attributes;
		const currentPostId = getCurrentPostId();
		const template = templateId && getEntityRecord( 'postType', 'wp_template', templateId );
		const editTemplateUrl = addQueryArgs( fullSiteEditing.editTemplateBaseUrl, {
			post: templateId,
			fse_parent_post: currentPostId,
		} );

		return {
			currentPostId,
			editTemplateUrl,
			template,
			templateBlock: getBlock( templateClientId ),
			templateTitle: get( template, [ 'title', 'rendered' ], '' ),
			isDirty: isEditedPostDirty(),
			isEditorSidebarOpened: !! isEditorSidebarOpened(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const { receiveBlocks } = dispatch( 'core/block-editor' );
		const { closeGeneralSidebar } = dispatch( 'core/edit-post' );
		const { clearSelectedBlock } = dispatch( 'core/editor' );
		const { template, templateClientId, setState } = ownProps;
		return {
			savePost: dispatch( 'core/editor' ).savePost,
			receiveTemplateBlocks: () => {
				if ( ! template || templateClientId ) {
					return;
				}

				const templateBlocks = parse( get( template, [ 'content', 'raw' ], '' ) );
				const templateBlock =
					templateBlocks.length === 1
						? templateBlocks[ 0 ]
						: createBlock( 'core/template', {}, templateBlocks );

				receiveBlocks( [ templateBlock ] );
				setState( { templateClientId: templateBlock.clientId } );
			},
			closeGeneralSidebar,
			clearSelectedBlock,
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
		isSelected,
		isEditorSidebarOpened,
		closeGeneralSidebar,
		clearSelectedBlock,
		shouldCloseSidebarOnSelect,
		setState,
	} ) => {
		if ( ! template ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			);
		}
		const [ navigateToTemplate, setNavigateToTemplate ] = useState( false );
		useEffect( () => {
			if ( navigateToTemplate && ! isDirty ) {
				window.location.href = editTemplateUrl;
			}
			receiveTemplateBlocks();
		} );

		useEffect( () => {
			if ( isSelected ) {
				if ( ! isEditorSidebarOpened ) {
					setState( { shouldCloseSidebarOnSelect: false } );
				} else if ( shouldCloseSidebarOnSelect ) {
					closeGeneralSidebar();
				} else {
					clearSelectedBlock();
				}
			} else {
				setState( { shouldCloseSidebarOnSelect: true } );
			}
		} );

		const { align, className } = attributes;

		const save = event => {
			if ( ! isDirty ) {
				return;
			}
			event.preventDefault();
			setNavigateToTemplate( true );
			savePost();
		};

		return (
			<div
				className={ classNames( 'template-block', className, {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ templateBlock && (
					<Fragment>
						<Disabled>
							<BlockEdit
								attributes={ templateBlock.attributes }
								block={ templateBlock }
								clientId={ templateBlock.clientId }
								isSelected={ false }
								name={ templateBlock.name }
								setAttributes={ noop }
							/>
						</Disabled>
						{ isSelected && (
							<Placeholder className="template-block__overlay">
								<Button href={ editTemplateUrl } onClick={ save } isDefault>
									{ navigateToTemplate ? <Spinner /> : sprintf( __( 'Edit %s' ), templateTitle ) }
								</Button>
							</Placeholder>
						) }
					</Fragment>
				) }
			</div>
		);
	}
);

export default TemplateEdit;
