/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { find, get, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { IconButton, Placeholder, SelectControl, Toolbar } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { BlockControls } from '@wordpress/editor';
import { Fragment, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

const edit = compose(
	withSelect( select => ( {
		// TODO: Replace with a better way to fetch pages
		pages: select( 'core' ).getEntityRecords( 'postType', 'page' ),
	} ) ),
	withState( {
		isEditing: false,
	} )
)( ( { attributes, isEditing, pages, setAttributes, setState } ) => {
	const { align, selectedPageId } = attributes;

	const selectOptions = [
		{ label: '', value: undefined },
		...map( pages, page => ( {
			label: page.title.rendered,
			value: page.id,
		} ) ),
	];

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onChange = pageId => {
		if ( pageId ) {
			setState( { isEditing: false } );
		}
		setAttributes( { selectedPageId: parseInt( pageId, 10 ) } );
	};

	const selectedPage = find( pages, { id: selectedPageId } );

	const showToggleButton = ! isEditing || !! selectedPageId;
	const showPlaceholder = isEditing || ! selectedPageId;
	const showPreview = ! isEditing && !! selectedPageId;

	return (
		<Fragment>
			{ showToggleButton && (
				<BlockControls>
					<Toolbar>
						<IconButton
							className={ classNames( 'components-icon-button components-toolbar__control', {
								'is-active': isEditing,
							} ) }
							label={ __( 'Change Preview' ) }
							onClick={ toggleEditing }
							icon="edit"
						/>
					</Toolbar>
				</BlockControls>
			) }
			<div
				className={ classNames( 'wpcom-page-content-block', {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ showPlaceholder && (
					<Placeholder
						icon="layout"
						label={ __( 'Page Content' ) }
						instructions={ __( 'Select a page to preview' ) }
					>
						<div className="wpcom-page-content-block__selector">
							<SelectControl
								onChange={ onChange }
								options={ selectOptions }
								value={ selectedPageId }
							/>
							{ !! selectedPageId && (
								<a href={ `?post=${ selectedPageId }&action=edit` }>{ __( 'Edit Page' ) }</a>
							) }
						</div>
					</Placeholder>
				) }
				{ showPreview && (
					<RawHTML className="wpcom-page-content-block__preview">
						{ get( selectedPage, 'content.rendered' ) }
					</RawHTML>
				) }
			</div>
		</Fragment>
	);
} );

registerBlockType( 'wpcom/page-content', {
	title: __( 'Page Content Preview' ),
	icon: 'layout',
	category: 'layout',
	attributes: {
		selectedPageId: { type: 'number' },
	},
	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
		multiple: false,
		reusable: false,
	},
	edit,
	save: () => null,
} );
