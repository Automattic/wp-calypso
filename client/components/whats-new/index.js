/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import QueryWhatsNewList from 'calypso/components/data/query-whats-new';

function WhatsNew( { siteId } ) {
	let listItems;

	if ( ! posts ) {
		// Placeholders
		listItems = times( 2, ( i ) => {
			return (
				/* eslint-disable */
				<li className="reader-related-card__list-item" key={ 'related-post-placeholder-' + i }>
					<WhatsNewItem post={ null } />
				</li>
				/* eslint-enable */
			);
		} );
	} else if ( posts.length === 0 ) {
		return null;
	} else {
		listItems = posts.map( ( post_id ) => {
			return (
				/* eslint-disable */
				<li key={ post_id } className="reader-related-card__list-item">
					<WhatsNewItem post={ post_id } onPostClick={ onPostClick } onSiteClick={ onSiteClick } />
				</li>
				/* eslint-enable */
			);
		} );
	}

	return (
		/* eslint-disable */
		<div className={ classnames( 'reader-related-card__blocks', className ) }>
			{ ! posts && <QueryWhatsNewList siteId={ siteId } postId={ postId } scope={ scope } /> }
			<h1 className="reader-related-card__heading">{ title }</h1>
			<ul className="reader-related-card__list">{ listItems }</ul>
		</div>
		/* eslint-enable */
	);
}

export const TBD = connect( ( state, ownProps ) => {
	return {
		list: relatedPostsForPost( state, ownProps.siteId, ownProps.postId, SCOPE_OTHER ),
	};
} )( WhatsNew );
