/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import * as stats from 'reader/stats';
import { isDiscoverEnabled } from 'reader/discover/helper';

const TagEmptyContent = React.createClass( {
	propTypes: {
		tag: React.PropTypes.string
	},

	shouldComponentUpdate() {
		return false;
	},

	recordAction() {
		stats.recordAction( 'clicked_following_on_empty' );
		stats.recordGaEvent( 'Clicked Following on EmptyContent' );
		stats.recordTrack( 'calypso_reader_following_on_empty_tag_stream_clicked' );
	},

	recordSecondaryAction() {
		stats.recordAction( 'clicked_discover_on_empty' );
		stats.recordGaEvent( 'Clicked Discover on EmptyContent' );
		stats.recordTrack( 'calypso_reader_discover_on_empty_tag_stream_clicked' );
	},

	render() {
		const action = ( <a
			className="empty-content__action button is-primary"
			onClick={ this.recordAction }
			href="/">{ this.translate( 'Back to Following' ) }</a> );

		const secondaryAction = isDiscoverEnabled()
			? ( <a
			className="empty-content__action button"
			onClick={ this.recordSecondaryAction }
			href="/discover">{ this.translate( 'Explore Discover' ) }</a> ) : null;

		const message = this.translate(
			'No posts have recently been tagged with {{tagName /}} for your language.',
			{ components: { tagName: <em>{ decodeURIComponent( this.props.tag ) }</em> } }
		);

		return ( <EmptyContent
			title={ this.translate( 'No recent posts' ) }
			line={ message }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

export default TagEmptyContent;
