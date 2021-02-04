/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import QueryWhatsNewList from 'calypso/components/data/query-whats-new';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWhatsNewList } from 'calypso/state/selectors/get-whats-new-list';

function WhatsNew( { siteId, list } ) {
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

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const list = getWhatsNewList( state );

	return {
		site: getSelectedSite( state ),
		siteId,
		list,
	};
};

export default connect( ( state, ownProps ) => {
	return {
		list: requestWhatsNewList( state, ownProps.siteId, ownProps.postId, SCOPE_OTHER ),
	};
} )( WhatsNew );
