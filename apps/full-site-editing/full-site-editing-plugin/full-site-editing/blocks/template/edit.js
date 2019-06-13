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
import { Fragment, RawHTML, useState, useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';
import './style.scss';

const TemplateEdit = compose(
	withSelect( ( select, { attributes } ) => {
		const { getEntityRecord } = select( 'core' );
		const { templateId } = attributes;
		return {
			template: templateId && getEntityRecord( 'postType', 'wp_template_part', templateId ),
		};
	} ),
	withState( { isEditing: false } )
)( ( { attributes, isEditing, template, setAttributes, setState } ) => {
	const { align, templateId } = attributes;

	const templateBlockRef = useRef( null );

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onSelectTemplate = ( { id } ) => {
		setState( { isEditing: false } );
		setAttributes( { templateId: id } );
	};

	const [ isHovered, setIsHovered ] = useState( false );
	const handleMouseOver = () => setIsHovered( true );
	const handleMouseOut = () => setIsHovered( false );

	useEffect( () => {
		templateBlockRef.current.addEventListener( 'mouseover', handleMouseOver );
		templateBlockRef.current.addEventListener( 'mouseout', handleMouseOut );

		return () => {
			templateBlockRef.current.removeEventListener( 'mouseover', handleMouseOver );
			templateBlockRef.current.removeEventListener( 'mouseout', handleMouseOut );
		};
	}, [ templateBlockRef.current ] );

	const showToggleButton = ! isEditing || !! templateId;
	const showPlaceholder = isEditing || ! templateId;
	const showContent = ! isEditing && !! templateId;

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
				ref={ templateBlockRef }
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
								initialValue={ get( template, [ 'title', 'rendered' ] ) }
								onSelectPost={ onSelectTemplate }
								postType="wp_template_part"
							/>
							{ !! template && (
								<a href={ `?post=${ templateId }&action=edit` }>
									{ sprintf( __( 'Edit "%s"' ), get( template, [ 'title', 'rendered' ], '' ) ) }
								</a>
							) }
						</div>
					</Placeholder>
				) }
				{ showContent && (
					<Fragment>
						<RawHTML className="template-block__content">
							{ get( template, [ 'content', 'rendered' ] ) }
						</RawHTML>
						{ isHovered && <div className="template-block__content_overlay" /> }
					</Fragment>
				) }
			</div>
		</Fragment>
	);
} );

export default TemplateEdit;
