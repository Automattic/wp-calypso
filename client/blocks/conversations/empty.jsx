/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'client/components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'client/reader/stats';

class ConversationsEmptyContent extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		recordTrack( 'calypso_reader_search_on_empty_stream_clicked' );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		const action = (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.recordAction }
					href="/read/search"
				>
					{ this.props.translate( 'Find Posts to Follow' ) }
				</a>
			),
			secondaryAction = null;

		return (
			<EmptyContent
				className="conversations__empty-content"
				title={ this.props.translate( 'Welcome to Conversations' ) }
				line={ this.props.translate(
					"When WordPress posts spark lively conversations, they'll appear here. " +
						'To get started, like or comment on some posts.'
				) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/illustrations/illustration-conversations-empty.svg' }
				illustrationWidth={ 400 }
			/>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default localize( ConversationsEmptyContent );
