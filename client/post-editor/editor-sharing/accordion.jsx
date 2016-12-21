/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { map, filter, uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import PostMetadata from 'lib/post-metadata';
import Sharing from './';
import AccordionSection from 'components/accordion/section';
import postUtils from 'lib/posts/utils';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { isJetpackModuleActive, getSiteOption } from 'state/sites/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { postTypeSupports } from 'state/post-types/selectors';

const EditorSharingAccordion = React.createClass( {
	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		connections: PropTypes.array,
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
		const targeted = filter( connections, ( { keyring_connection_ID: ID } ) => ! ( ID in skipped ) );

		return map( uniqBy( targeted, 'service' ), 'label' ).join( ', ' );
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

		return (
			<Accordion
				title={ this.translate( 'Sharing' ) }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="share" /> }
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
		const isPublicizeEnabled = (
			false !== isJetpackModuleActive( state, siteId, 'publicize' ) &&
			true !== getSiteOption( state, siteId, 'publicize_permanently_disabled' ) &&
			postTypeSupports( state, siteId, postType, 'publicize' )
		);
		const isSharingActive = false !== isJetpackModuleActive( state, siteId, 'sharedaddy' );
		const isLikesActive = false !== isJetpackModuleActive( state, siteId, 'likes' );

		return {
			connections: getSiteUserConnections( state, siteId, userId ),
			isSharingActive,
			isLikesActive,
			isPublicizeEnabled
		};
	},
)( EditorSharingAccordion );
