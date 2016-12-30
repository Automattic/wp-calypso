/**
 * External dependencies
 */
import { endsWith, filter, find, get } from 'lodash';
 // TODO: Calling translate in selectors is not ideal
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getRawSite, getSiteAdminUrl } from 'state/sites/selectors';
import { getPostTypes } from 'state/post-types/selectors';


function getDefaultItemTypes( state, siteId ) {
	const site = getRawSite( state, siteId );
	const adminUrl = getSiteAdminUrl( state, siteId );
	if ( ! site ) {
		return [];
	}

	return [
		{
			name: 'page',
			family: 'post_type',
			icon: 'document',
			renderer: 'renderPostOptions',
			show: true,
			label: translate( 'Page' ),
			notFoundLabel: translate( 'No pages found.' ),
			createLink: `/page/${ siteId }/new`,
			gaEventLabel: 'Page'
		},
		{
			name: 'custom',
			family: 'custom',
			icon: 'link',
			renderer: 'renderLinkOptions',
			show: true,
			label: translate( 'Link' ),
			gaEventLabel: 'Link'
		},
		{
			name: 'category',
			family: 'taxonomy',
			icon: 'category',
			renderer: 'renderTaxonomyOptions',
			show: true,
			label: translate( 'Category' ),
			notFoundLabel: translate( 'No categories found.' ),
			createLink: `${ adminUrl }edit-tags.php?taxonomy=category`,
			gaEventLabel: 'Category'
		},
		{
			name: 'post_tag',
			family: 'taxonomy',
			icon: 'tag',
			renderer: 'renderTaxonomyOptions',
			show: true,
			label: translate( 'Tag' ),
			notFoundLabel: translate( 'No tags found.' ),
			createLink: `${ adminUrl }edit-tags.php?taxonomy=post_tag`,
			gaEventLabel: 'Tag'
		},
		{
			name: 'post_format',
			family: 'taxonomy',
			icon: 'summary',
			renderer: 'renderTaxonomyContents',
			show: false,
			label: translate( 'Post Format' ),
			notFoundLabel: translate( 'No post formats found.' ),
			gaEventLabel: 'Post Format'
		},
		{
			name: 'post',
			family: 'post_type',
			icon: 'standard',
			renderer: 'renderPostOptions',
			show: true,
			label: translate( 'Post' ),
			notFoundLabel: translate( 'No posts found.' ),
			createLink: `/post/${ siteId }/new`,
			gaEventLabel: 'Post'
		}
	];
}

export default function getMySitesMenuItemTypes( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return [];
	}
	const defaultItems = getDefaultItemTypes( state, siteId );
	const postTypes = getPostTypes( state, siteId );
	const postTypesItems = filter( postTypes, type =>
		find( defaultItems, { name: type.name } ) === undefined &&
		type.api_queryable === true &&
		type.map_meta_cap === true
	).map( type => {
		const notFoundLabel = get( type, [ 'labels', 'not_found' ], '' );
		return {
			name: type.name,
			family: 'post_type',
			icon: 'standard',
			renderer: 'renderPostOptions',
			show: true,
			label: type.label, //FIXME: how do we handle i18n here?
			notFoundLabel: notFoundLabel && endsWith( notFoundLabel, '.' ) ? notFoundLabel : notFoundLabel + '.',
			createLink: `/edit/${ type.name }/${ site.slug }`, // TODO: Use the getEditorNewPostPath() selector.
			gaEventLabel: type.label
		};
	} );

	return defaultItems.concat( postTypesItems );
}
