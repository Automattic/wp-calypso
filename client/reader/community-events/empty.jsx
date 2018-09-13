/** @format */
/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';

const debug = debugFactory( 'calypso:reader:community-events' );

class EmptyCommunityEvents extends React.PureComponent {
	render() {
		debug( 'Error loading events' );
		const { translate } = this.props;

		return (
			<CompactCard className="community-events__empty-results">
				<p>{ translate( "Sorry, there don't seem to be any events in your area right now." ) }</p>
				<p>
					{ translate(
						"Head over to {{link1}}WordPress.tv{{/link1}} to see what's happening in the " +
							'world of WordPress, or {{link2}}find a meetup{{/link2}} near you.',
						{
							components: {
								link1: <ExternalLink href="https://wordpress.tv/" icon target="_blank" />,
								link2: (
									<ExternalLink
										href="https://make.wordpress.org/community/events/"
										icon
										target="_blank"
									/>
								),
							},
						}
					) }
				</p>
			</CompactCard>
		);
	}
}

export default localize( EmptyCommunityEvents );
