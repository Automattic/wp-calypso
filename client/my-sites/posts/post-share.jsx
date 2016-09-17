/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import PublicizeServices from 'post-editor/editor-sharing/publicize-services';
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { postTypeSupports } from 'state/post-types/selectors';
import { isJetpackModuleActive } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'state/sharing/publicize/actions';

const PostSharing = React.createClass( {
	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		siteId: PropTypes.number,
		isPublicizeEnabled: PropTypes.bool,
		connections: PropTypes.array,
		requestConnections: PropTypes.func
	},

	hasConnections: function() {
		return this.props.connections && this.props.connections.length;
	},

	renderServices: function() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeServices
				post={ this.props.post }
				siteId={ this.props.site.ID }
				connections={ this.props.connections }
				newConnectionPopup={ ()=>{} }
			/>
		);
	},

	render: function() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		if ( this.props.site && this.props.site.options.publicize_permanently_disabled ) {
			return (
				<div className="editor-sharing__publicize-disabled">
					<p><span>{ this.translate( 'Publicize is disabled on this site.' ) }</span></p>
				</div>
			);
		}

		const classes = classNames( 'posts__post-share', {
			'has-connections': this.hasConnections()
		} );

		return (
			<div className={ classes }>
				{ this.props.siteId && <QueryPostTypes siteId={ this.props.siteId } /> }
				<h3 className="posts__post-share-title">
					{ this.translate( 'Share the post and spread the word!' ) }
				</h3>
				{ this.renderServices() }
				<Button>{ this.translate( 'Share post' ) }</Button>
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );
		const postType = props.post.type;
		const isPublicizeEnabled = (
			false !== isJetpackModuleActive( state, siteId, 'publicize' ) &&
			postTypeSupports( state, siteId, postType, 'publicize' )
		);

		return {
			siteId,
			isPublicizeEnabled,
			connections: getSiteUserConnections( state, siteId, userId )
		};
	},
	{ requestConnections }
)( PostSharing );
