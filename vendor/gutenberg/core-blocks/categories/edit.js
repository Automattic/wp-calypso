/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { PanelBody, Placeholder, Spinner, ToggleControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { times, unescape } from 'lodash';
import {
	InspectorControls,
	BlockControls,
	BlockAlignmentToolbar,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

class CategoriesEdit extends Component {
	constructor() {
		super( ...arguments );

		this.toggleDisplayAsDropdown = this.toggleDisplayAsDropdown.bind( this );
		this.toggleShowPostCounts = this.toggleShowPostCounts.bind( this );
		this.toggleShowHierarchy = this.toggleShowHierarchy.bind( this );
	}

	toggleDisplayAsDropdown() {
		const { attributes, setAttributes } = this.props;
		const { displayAsDropdown } = attributes;

		setAttributes( { displayAsDropdown: ! displayAsDropdown } );
	}

	toggleShowPostCounts() {
		const { attributes, setAttributes } = this.props;
		const { showPostCounts } = attributes;

		setAttributes( { showPostCounts: ! showPostCounts } );
	}

	toggleShowHierarchy() {
		const { attributes, setAttributes } = this.props;
		const { showHierarchy } = attributes;

		setAttributes( { showHierarchy: ! showHierarchy } );
	}

	getCategories( parentId = null ) {
		const categories = this.props.categories;
		if ( ! categories || ! categories.length ) {
			return [];
		}

		if ( parentId === null ) {
			return categories;
		}

		return categories.filter( ( category ) => category.parent === parentId );
	}

	getCategoryListClassName( level ) {
		const { className } = this.props;
		return `${ className }__list ${ className }__list-level-${ level }`;
	}

	renderCategoryName( category ) {
		if ( ! category.name ) {
			return __( '(Untitled)' );
		}

		return unescape( category.name ).trim();
	}

	renderCategoryList() {
		const { showHierarchy } = this.props.attributes;
		const parentId = showHierarchy ? 0 : null;
		const categories = this.getCategories( parentId );

		return (
			<ul className={ this.getCategoryListClassName( 0 ) }>
				{ categories.map( ( category ) => this.renderCategoryListItem( category, 0 ) ) }
			</ul>
		);
	}

	renderCategoryListItem( category, level ) {
		const { showHierarchy, showPostCounts } = this.props.attributes;
		const childCategories = this.getCategories( category.id );

		return (
			<li key={ category.id }>
				<a href={ category.link } target="_blank">{ this.renderCategoryName( category ) }</a>
				{ showPostCounts &&
					<span className={ `${ this.props.className }__post-count` }>
						{ ' ' }({ category.count })
					</span>
				}

				{
					showHierarchy &&
					!! childCategories.length && (
						<ul className={ this.getCategoryListClassName( level + 1 ) }>
							{ childCategories.map( ( childCategory ) => this.renderCategoryListItem( childCategory, level + 1 ) ) }
						</ul>
					)
				}
			</li>
		);
	}

	renderCategoryDropdown() {
		const { showHierarchy } = this.props.attributes;
		const parentId = showHierarchy ? 0 : null;
		const categories = this.getCategories( parentId );

		return (
			<select className={ `${ this.props.className }__dropdown` }>
				{ categories.map( ( category ) => this.renderCategoryDropdownItem( category, 0 ) ) }
			</select>
		);
	}

	renderCategoryDropdownItem( category, level ) {
		const { showHierarchy, showPostCounts } = this.props.attributes;
		const childCategories = this.getCategories( category.id );

		return [
			<option key={ category.id }>
				{ times( level * 3, () => '\xa0' ) }
				{ this.renderCategoryName( category ) }
				{
					!! showPostCounts ?
						` (${ category.count })` :
						''
				}
			</option>,
			showHierarchy &&
			!! childCategories.length && (
				childCategories.map( ( childCategory ) => this.renderCategoryDropdownItem( childCategory, level + 1 ) )
			),
		];
	}

	render() {
		const { attributes, setAttributes, isRequesting } = this.props;
		const { align, displayAsDropdown, showHierarchy, showPostCounts } = attributes;

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Categories Settings' ) }>
					<ToggleControl
						label={ __( 'Display as dropdown' ) }
						checked={ displayAsDropdown }
						onChange={ this.toggleDisplayAsDropdown }
					/>
					<ToggleControl
						label={ __( 'Show post counts' ) }
						checked={ showPostCounts }
						onChange={ this.toggleShowPostCounts }
					/>
					<ToggleControl
						label={ __( 'Show hierarchy' ) }
						checked={ showHierarchy }
						onChange={ this.toggleShowHierarchy }
					/>
				</PanelBody>
			</InspectorControls>
		);

		if ( isRequesting ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Categories' ) }
					>
						<Spinner />
					</Placeholder>
				</Fragment>
			);
		}

		return (
			<Fragment>
				{ inspectorControls }
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
						controls={ [ 'left', 'center', 'right', 'full' ] }
					/>
				</BlockControls>
				<div className={ this.props.className }>
					{
						displayAsDropdown ?
							this.renderCategoryDropdown() :
							this.renderCategoryList()
					}
				</div>
			</Fragment>
		);
	}
}

export default withSelect( ( select ) => {
	const { getCategories, isRequestingCategories } = select( 'core' );

	return {
		categories: getCategories(),
		isRequesting: isRequestingCategories(),
	};
} )( CategoriesEdit );
