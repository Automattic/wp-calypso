/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import VerticalMenu from 'components/vertical-menu';
import { SocialItem } from 'components/vertical-menu/items';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost } from 'state/posts/selectors';
import {
	getSectionName,
	getSelectedSite
} from 'state/ui/selectors';

const Sidebar = ( { translate, post, selectPreview } ) => {
	const services = compact( [
		post && 'wordpress',
		'google',
		'facebook',
		'twitter'
	] );

	return (
		<div className="seo-preview-pane__sidebar">
			<div className="seo-preview-pane__explanation">
				<h1 className="seo-preview-pane__title">
					{ translate( 'External previews' ) }
				</h1>
				<p className="seo-preview-pane__description">
					{ translate(
						'Below you\'ll find previews that ' +
						'represent how your post will look ' +
						'when it\'s found or shared across a ' +
						'variety of networks.'
					) }
				</p>
			</div>
			<VerticalMenu onClick={ selectPreview }>
				{ services.map( service => <SocialItem { ...{ key: service, service } } /> ) }
			</VerticalMenu>
		</div>
	);
};

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const postId = getEditorPostId( state );
	const isEditorShowing = 'post-editor' === getSectionName( state );

	return {
		post: isEditorShowing && getSitePost( state, site.ID, postId )
	};
};

export default connect( mapStateToProps )( localize( Sidebar ) );
