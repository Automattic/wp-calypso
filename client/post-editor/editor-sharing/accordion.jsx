/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { map, includes } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import serviceConnections from 'my-sites/sharing/connections/service-connections';
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
import { fetchConnections as requestConnections } from 'state/sharing/publicize/actions';

const EditorSharingAccordion = React.createClass( {
	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		isNew: PropTypes.bool,
		connections: PropTypes.array,
		isPublicizeEnabled: PropTypes.bool
	},

	getSubtitle: function() {
		const { isPublicizeEnabled, post, connections } = this.props;
		if ( ! isPublicizeEnabled || ! post || ! connections ) {
			return;
		}

		const skipped = PostMetadata.publicizeSkipped( post );
		const targeted = connections.filter( ( connection ) => {
			return ! includes( skipped, connection.keyring_connection_ID );
		} );
		const targetedServices = serviceConnections.getServicesFromConnections( targeted );

		return map( targetedServices, 'label' ).join( ', ' );
	},

	renderShortUrl: function() {
		var classes = classNames( 'editor-sharing__shortlink', {
			'is-standalone': this.hideSharing()
		} );

		if ( ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		return(
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
		return this.props.site &&
			this.props.site.jetpack &&
			! this.props.site.isModuleActive( 'publicize' ) &&
			! this.props.site.isModuleActive( 'sharedaddy' ) &&
			! this.props.site.isModuleActive( 'likes' );
	},

	render: function() {
		var hideSharing = this.hideSharing(),
			classes = classNames( 'editor-sharing__accordion', this.props.className, {
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

		return {
			isPublicizeEnabled,
			connections: getSiteUserConnections( state, siteId, userId )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestConnections
		}, dispatch );
	}
)( EditorSharingAccordion );
