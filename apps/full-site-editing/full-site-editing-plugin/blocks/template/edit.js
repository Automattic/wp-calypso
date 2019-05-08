/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { IconButton, Placeholder, Toolbar } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { BlockControls } from '@wordpress/editor';
import { Fragment, RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';
import './style.scss';

const TemplateEdit = compose(
	withSelect( ( select, { attributes } ) => {
		const { getEntityRecord } = select( 'core' );
		const { selectedPostId, selectedPostType } = attributes;
		return {
			selectedPost: getEntityRecord( 'postType', selectedPostType, selectedPostId ),
		};
	} ),
	withState( { isEditing: false } )
)( ( { attributes, isEditing, selectedPost, setAttributes, setState } ) => {
	const { align, selectedPostId } = attributes;

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onSelectPost = ( { id, type } ) => {
		setState( { isEditing: false } );
		setAttributes( {
			selectedPostId: id,
			selectedPostType: type,
		} );
	};

	const showToggleButton = ! isEditing || !! selectedPostId;
	const showPlaceholder = isEditing || ! selectedPostId;
	const showContent = ! isEditing && !! selectedPostId;

	return (
		<Fragment>
			{ showToggleButton && (
				<BlockControls>
					<Toolbar>
						<IconButton
							className={ classNames( 'components-icon-button components-toolbar__control', {
								'is-active': isEditing,
							} ) }
							label={ __( 'Change Template Part' ) }
							onClick={ toggleEditing }
							icon="edit"
						/>
					</Toolbar>
				</BlockControls>
			) }
			<div
				className={ classNames( 'template-block', {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ showPlaceholder && (
					<Placeholder
						icon="layout"
						label={ __( 'Template Part' ) }
						instructions={ __( 'Select a template part to display' ) }
					>
						<div className="template-block__selector">
							<PostAutocomplete
								defaultValue={ get( selectedPost, 'title.rendered' ) }
								onSelectPost={ onSelectPost }
								postType="wp_template"
							/>
							{ !! selectedPost && (
								<a href={ `?post=${ selectedPost.id }&action=edit` }>
									{ sprintf( __( 'Edit "%s"' ), get( selectedPost, 'title.rendered', '' ) ) }
								</a>
							) }
						</div>
					</Placeholder>
				) }
				{ showContent && (
					<RawHTML className="template-block__content">
						{ get( selectedPost, 'content.rendered' ) }
					</RawHTML>
				) }
			</div>
		</Fragment>
	);
} );

export default TemplateEdit;
