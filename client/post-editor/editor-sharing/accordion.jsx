/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'state/sharing/publicize/actions';

const EditorSharingAccordion = React.createClass( {
	displayName: 'EditorSharingAccordion',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		connections: React.PropTypes.array,
		requestConnections: React.PropTypes.func
	},

	getSubtitle: function() {
		var skipped, targeted;

		if ( this.props.site && (
				( this.props.site.jetpack && ! this.props.site.isModuleActive( 'publicize' ) ) ||
				this.props.site.options.publicize_permanently_disabled
		) ) {
			return;
		}

		if ( postUtils.isPage( this.props.post ) ) {
			return;
		}

		if ( ! this.props.post || ! this.props.connections ) {
			return this.translate( 'Loading…' );
		}

		skipped = PostMetadata.publicizeSkipped( this.props.post );
		targeted = this.props.connections.filter( function( connection ) {
			return -1 === skipped.indexOf( connection.keyring_connection_ID );
		} );

		return serviceConnections.getServicesFromConnections( targeted ).map( function( service ) {
			return service.label;
		} ).join( ', ' );
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
		const site = getSelectedSite( state );
		const user = getCurrentUser( state );

		return {
			// [TODO]: Reintroduce selected site from Redux state once needs
			// have been met for use (e.g. `site.isModuleActive`)
			connections: site && user ? getSiteUserConnections( state, site.ID, user.ID ) : null
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestConnections
		}, dispatch );
	}
)( EditorSharingAccordion );
