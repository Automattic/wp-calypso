/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import FormTextInput from 'components/forms/form-text-input';
import PostMetadata from 'lib/post-metadata';
import Sharing from './';
import AccordionSection from 'components/accordion/section';
import postUtils from 'lib/posts/utils';
import { isMobile } from 'lib/viewport';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { isJetpackModuleActive } from 'state/sites/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { hasBrokenSiteUserConnection, isPublicizeEnabled } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

const EditorSharingAccordion = React.createClass( {
	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		connections: PropTypes.array,
		hasBrokenConnection: PropTypes.bool,
		isPublicizeEnabled: PropTypes.bool,
		isSharingActive: PropTypes.bool,
		isLikesActive: PropTypes.bool
	},

	getSubtitle: function() {
		const { isPublicizeEnabled, post, connections } = this.props;
		if ( ! isPublicizeEnabled || ! post || ! connections ) {
			return;
		}

		const skipped = PostMetadata.publicizeSkipped( post );

		return reduce( connections, ( memo, connection ) => {
			const { keyring_connection_ID: id, label } = connection;
			if ( ! includes( skipped, id ) && ! includes( memo, label ) ) {
				memo.push( label );
			}

			return memo;
		}, [] ).join( ', ' );
	},

	renderShortUrl: function() {
		const classes = classNames( 'editor-sharing__shortlink', {
			'is-standalone': this.hideSharing()
		} );

		if ( ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		return (
			<div className={ classes }>
				<label
					className="editor-sharing__shortlink-label"
					htmlFor="shortlink-field"
				>
					{ this.translate( 'Shortlink' ) }
				</label>
				<FormTextInput
					className="editor-sharing__shortlink-field"
					id="shortlink-field"
					value={ this.props.post.short_URL }
					size={ this.props.post.short_URL && this.props.post.short_URL.length }
					readOnly
					selectOnFocus
				/>
			</div>
		);
	},

	hideSharing: function() {
		const { isSharingActive, isLikesActive, isPublicizeEnabled } = this.props;
		return ! isSharingActive && ! isLikesActive && ! isPublicizeEnabled;
	},

	render: function() {
		const hideSharing = this.hideSharing();
		const classes = classNames( 'editor-sharing__accordion', this.props.className, {
			'is-loading': ! this.props.post || ! this.props.connections
		} );

		// if sharing is hidden, and post is not published (no short URL yet),
		// then do not render this accordion
		if ( hideSharing && ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		let status;
		if ( this.props.hasBrokenConnection ) {
			status = {
				type: 'warning',
				text: this.translate( 'A broken connection requires repair', {
					comment: 'Publicize connection deauthorized, needs user action to fix'
				} ),
				url: `/sharing/${ this.props.site.slug }`,
				position: isMobile() ? 'top left' : 'top',
				onClick: this.props.onStatusClick
			};
		}

		return (
			<Accordion
				title={ this.translate( 'Sharing' ) }
				subtitle={ this.getSubtitle() }
				status={ status }
				className={ classes }>
				{ this.props.site && (
					<QueryPublicizeConnections siteId={ this.props.site.ID } />
				) }
				<AccordionSection>
					{ ! hideSharing && (
						<Sharing site={ this.props.site } post={ this.props.post } />
					) }
					{ this.renderShortUrl() }
				</AccordionSection>
			</Accordion>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const isSharingActive = false !== isJetpackModuleActive( state, siteId, 'sharedaddy' );
		const isLikesActive = false !== isJetpackModuleActive( state, siteId, 'likes' );

		return {
			connections: getSiteUserConnections( state, siteId, userId ),
			hasBrokenConnection: hasBrokenSiteUserConnection( state, siteId, userId ),
			isSharingActive,
			isLikesActive,
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
		};
	},
	{
		onStatusClick: () => recordGoogleEvent( 'Editor', 'Clicked Accordion Broken Status' )
	}
)( EditorSharingAccordion );
