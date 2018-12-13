/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PanelBody, TextControl, ExternalLink } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose, ifCondition, withState } from '@wordpress/compose';
import { cleanForSlug } from '@wordpress/editor';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-link';

function PostLink( {
	isOpened,
	onTogglePanel,
	isEditable,
	postLink,
	permalinkParts,
	editPermalink,
	forceEmptyField,
	setState,
	postTitle,
	postSlug,
	postID,
} ) {
	const { prefix, suffix } = permalinkParts;
	let prefixElement, postNameElement, suffixElement;
	const currentSlug = postSlug || cleanForSlug( postTitle ) || postID;
	if ( isEditable ) {
		prefixElement = prefix && <span className="edit-post-post-link__link-prefix">{ prefix }</span>;
		postNameElement = currentSlug && (
			<span className="edit-post-post-link__link-post-name">{ currentSlug }</span>
		);
		suffixElement = suffix && <span className="edit-post-post-link__link-suffix">{ suffix }</span>;
	}

	return (
		<PanelBody title={ __( 'Permalink' ) } opened={ isOpened } onToggle={ onTogglePanel }>
			{ isEditable && (
				<TextControl
					label={ __( 'URL' ) }
					value={ forceEmptyField ? '' : currentSlug }
					onChange={ newValue => {
						editPermalink( newValue );
						// When we delete the field the permalink gets
						// reverted to the original value.
						// The forceEmptyField logic allows the user to have
						// the field temporarily empty while typing.
						if ( ! newValue ) {
							if ( ! forceEmptyField ) {
								setState( {
									forceEmptyField: true,
								} );
							}
							return;
						}
						if ( forceEmptyField ) {
							setState( {
								forceEmptyField: false,
							} );
						}
					} }
					onBlur={ event => {
						editPermalink( cleanForSlug( event.target.value ) );
						if ( forceEmptyField ) {
							setState( {
								forceEmptyField: false,
							} );
						}
					} }
				/>
			) }
			<p className="edit-post-post-link__preview-label">{ __( 'Preview' ) }</p>
			<ExternalLink className="edit-post-post-link__link" href={ postLink } target="_blank">
				{ isEditable ? (
					<Fragment>
						{ prefixElement }
						{ postNameElement }
						{ suffixElement }
					</Fragment>
				) : (
					postLink
				) }
			</ExternalLink>
		</PanelBody>
	);
}

export default compose( [
	withSelect( select => {
		const {
			isEditedPostNew,
			isPermalinkEditable,
			getCurrentPost,
			isCurrentPostPublished,
			getPermalinkParts,
			getEditedPostAttribute,
		} = select( 'core/editor' );
		const { isEditorPanelEnabled, isEditorPanelOpened } = select( 'core/edit-post' );
		const { getPostType } = select( 'core' );

		const { link, id } = getCurrentPost();
		const postTypeName = getEditedPostAttribute( 'type' );
		const postType = getPostType( postTypeName );
		return {
			isNew: isEditedPostNew(),
			postLink: link,
			isEditable: isPermalinkEditable(),
			isPublished: isCurrentPostPublished(),
			isOpened: isEditorPanelOpened( PANEL_NAME ),
			permalinkParts: getPermalinkParts(),
			isEnabled: isEditorPanelEnabled( PANEL_NAME ),
			isViewable: get( postType, [ 'viewable' ], false ),
			postTitle: getEditedPostAttribute( 'title' ),
			postSlug: getEditedPostAttribute( 'slug' ),
			postID: id,
		};
	} ),
	ifCondition( ( { isEnabled, isNew, postLink, isViewable } ) => {
		return isEnabled && ! isNew && postLink && isViewable;
	} ),
	withDispatch( dispatch => {
		const { toggleEditorPanelOpened } = dispatch( 'core/edit-post' );
		const { editPost } = dispatch( 'core/editor' );
		return {
			onTogglePanel: () => toggleEditorPanelOpened( PANEL_NAME ),
			editPermalink: newSlug => {
				editPost( { slug: newSlug } );
			},
		};
	} ),
	withState( {
		forceEmptyField: false,
	} ),
] )( PostLink );
