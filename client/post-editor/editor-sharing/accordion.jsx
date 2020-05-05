/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
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
import * as postUtils from 'state/posts/utils';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost, getEditedPostValue } from 'state/posts/selectors';
import { getSiteSlug, isJetpackModuleActive } from 'state/sites/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import hasBrokenSiteUserConnection from 'state/selectors/has-broken-site-user-connection';
import hasInvalidSiteUserConnection from 'state/selectors/has-invalid-site-user-connection';
import isPublicizeEnabled from 'state/selectors/is-publicize-enabled';
import { recordGoogleEvent } from 'state/analytics/actions';

class EditorSharingAccordion extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		post: PropTypes.object,
		connections: PropTypes.array,
		hasBrokenConnection: PropTypes.bool,
		hasInvalidConnection: PropTypes.bool,
		isPublicizeEnabled: PropTypes.bool,
		isSharingActive: PropTypes.bool,
		isLikesActive: PropTypes.bool,
	};

	getSubtitle() {
		const { post, connections } = this.props;
		if ( ! this.props.isPublicizeEnabled || ! post || ! connections ) {
			return;
		}

		const skipped = PostMetadata.publicizeSkipped( post );

		return reduce(
			connections,
			( memo, connection ) => {
				const { keyring_connection_ID: id, label } = connection;
				if ( ! includes( skipped, id ) && ! includes( memo, label ) ) {
					memo.push( label );
				}

				return memo;
			},
			[]
		).join( ', ' );
	}

	renderShortUrl() {
		const classes = classNames( 'editor-sharing__shortlink', {
			'is-standalone': this.hideSharing(),
		} );

		if ( ! postUtils.isPublished( this.props.post ) ) {
			return null;
		}

		return (
			<div className={ classes }>
				<label className="editor-sharing__shortlink-label" htmlFor="shortlink-field">
					{ this.props.translate( 'Shortlink' ) }
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
	}

	hideSharing() {
		return (
			! this.props.isSharingActive && ! this.props.isLikesActive && ! this.props.isPublicizeEnabled
		);
	}

	render() {
		const hideSharing = this.hideSharing();
		const classes = classNames( 'editor-sharing__accordion', this.props.className, {
			'is-loading': ! this.props.post || ! this.props.connections,
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
				text: this.props.translate( 'A broken connection requires repair', {
					comment: 'Publicize connection deauthorized, needs user action to fix',
				} ),
				url: `/marketing/connections/${ this.props.siteSlug }`,
				position: isMobile() ? 'top left' : 'top',
				onClick: this.props.onStatusClick,
			};
		}

		if ( this.props.hasInvalidConnection ) {
			status = {
				type: 'error',
				text: this.props.translate( 'A connection is broken and must be removed', {
					comment: 'Publicize connection is invalid.',
				} ),
				position: isMobile() ? 'top left' : 'top',
				onClick: this.props.onStatusClick,
			};
		}

		return (
			<Accordion
				title={ this.props.translate( 'Sharing' ) }
				subtitle={ this.getSubtitle() }
				status={ status }
				className={ classes }
				e2eTitle="sharing"
			>
				{ this.props.siteId && <QueryPublicizeConnections siteId={ this.props.siteId } /> }
				<AccordionSection>
					{ ! hideSharing && <Sharing /> }
					{ this.renderShortUrl() }
				</AccordionSection>
			</Accordion>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const isSharingActive = false !== isJetpackModuleActive( state, siteId, 'sharedaddy' );
		const isLikesActive = false !== isJetpackModuleActive( state, siteId, 'likes' );

		return {
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			post,
			connections: getSiteUserConnections( state, siteId, userId ),
			hasBrokenConnection: hasBrokenSiteUserConnection( state, siteId, userId ),
			hasInvalidConnection: hasInvalidSiteUserConnection( state, siteId, userId ),
			isSharingActive,
			isLikesActive,
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
		};
	},
	{
		onStatusClick: () => recordGoogleEvent( 'Editor', 'Clicked Accordion Broken Status' ),
	}
)( localize( EditorSharingAccordion ) );
