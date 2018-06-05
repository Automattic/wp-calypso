/**
 * @format
 */

/*
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { assign, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import RememberPostButton from './button';
import isRememberedPost from 'state/selectors/is-remembered-post';
import { rememberPost, forgetPost } from 'state/reader/remembered-posts/actions';
import { getTracksPropertiesForPost } from 'reader/stats';
import { recordTracksEvent } from 'state/analytics/actions';

class RememberPostButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		post: PropTypes.object, // for stats only
		rememberSource: PropTypes.string,
	};

	static defaultProps = {
		onToggle: noop,
	};

	handleToggle = rememberThisPost => {
		const { siteId, postId, post, rememberSource } = this.props;

		const tracksProperties = assign( getTracksPropertiesForPost( post ), {
			remember_source: rememberSource,
		} );

		if ( rememberThisPost ) {
			this.props.recordTracksEvent( 'calypso_reader_post_remembered', tracksProperties );
			this.props.rememberPost( { siteId, postId } );
		} else {
			this.props.recordTracksEvent( 'calypso_reader_post_forgotten', tracksProperties );
			this.props.forgetPost( { siteId, postId } );
		}

		this.props.onToggle( rememberThisPost );
	};

	render() {
		return (
			<RememberPostButton
				isRemembered={ this.props.isRemembered }
				onToggle={ this.handleToggle }
				className={ this.props.className }
				tagName={ this.props.tagName }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isRemembered: isRememberedPost( state, {
			siteId: ownProps.siteId,
			postId: ownProps.postId,
		} ),
	} ),
	{
		rememberPost,
		forgetPost,
		recordTracksEvent,
	}
)( RememberPostButtonContainer );
