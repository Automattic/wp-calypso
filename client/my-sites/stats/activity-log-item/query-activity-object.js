/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';

export default class QueryActivityObject extends PureComponent {
	static propTypes = {
		group: PropTypes.oneOf( [
			'attachment',
			'comment',
			'core',
			'menu',
			'plugin',
			'post',
			'term',
			'theme',
			'user',
			'widget',
		] ).isRequired,

		object: PropTypes.shape( {
			attachment: PropTypes.shape( {
				mime_type: PropTypes.string,
				id: PropTypes.number.isRequired,
				title: PropTypes.string.isRequired,
				url: PropTypes.shape( {
					host: PropTypes.string.isRequired,
					url: PropTypes.string.isRequired,
					host_reversed: PropTypes.string.isRequired,
				} ).isRequired,
			} ),

			comment: PropTypes.shape( {
				approved: PropTypes.bool.isRequired,
				id: PropTypes.number.isRequired,
			} ),

			core: PropTypes.shape( {
				new_version: PropTypes.string,
				old_version: PropTypes.string,
			} ),

			menu: PropTypes.shape( {
				id: PropTypes.number,
				name: PropTypes.string,
			} ),

			plugin: PropTypes.oneOfType( [
				PropTypes.shape( {
					name: PropTypes.string,
					previous_version: PropTypes.string,
					slug: PropTypes.string,
					version: PropTypes.string,
				} ),
				PropTypes.arrayOf(
					PropTypes.shape( {
						name: PropTypes.string,
						previous_version: PropTypes.string,
						slug: PropTypes.string,
						version: PropTypes.string,
					} ),
				),
			] ),

			post: PropTypes.shape( {
				id: PropTypes.number.isRequired,
				status: PropTypes.string.isRequired,
				type: PropTypes.string,
				title: PropTypes.string,
			} ),

			term: PropTypes.shape( {
				id: PropTypes.number.isRequired,
				title: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired,
			} ),

			theme: PropTypes.oneOfType( [
				PropTypes.arrayOf(
					PropTypes.shape( {
						name: PropTypes.string,
						slug: PropTypes.string,
						uri: PropTypes.string,
						version: PropTypes.string,
					} )
				),
				PropTypes.shape( {
					name: PropTypes.string,
					slug: PropTypes.string,
					uri: PropTypes.string,
					version: PropTypes.string,
				} ),
			] ),

			user: PropTypes.shape( {
				display_name: PropTypes.string,
				external_user_id: PropTypes.string,
				login: PropTypes.string,
				wpcom_user_id: PropTypes.number,
			} ),

			widget: PropTypes.shape( {
				id: PropTypes.number,
				name: PropTypes.string,
				sidebar: PropTypes.string,
			} ),
		} ),

		siteId: PropTypes.number.isRequired,
	};

	render() {
		const {
			group,
			object,
			siteId,
		} = this.props;
		switch ( group ) {
			case 'post': {
				const postId = get( object, [ 'post', 'id' ] );
				return postId && (
					<QueryPosts siteId={ siteId } postId={ postId } />
				);
			}
			default:
				return null;
		}
	}
}

