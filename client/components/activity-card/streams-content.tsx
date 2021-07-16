/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ActivityCard from '.';
import ActivityMedia from './activity-media';

/**
 * Type dependencies
 */
import { Activity } from './types';

type OwnProps = {
	streams: Activity[];
};

const StreamsContentItem: React.FC< { stream: Activity } > = ( { stream } ) => {
	const { activityMedia } = stream;

	if ( activityMedia?.available ) {
		return (
			<div className="activity-card__streams-item">
				<div className="activity-card__streams-item-title">{ activityMedia.name }</div>
				<ActivityMedia
					name={ activityMedia.name }
					fullImage={ activityMedia.medium_url || activityMedia.thumbnail_url }
				/>
			</div>
		);
	}

	return <ActivityCard summarize activity={ stream } />;
};

const StreamsContent: React.FC< OwnProps > = ( { streams } ) => (
	<>
		{ streams.map( ( item, index ) => (
			<StreamsContentItem key={ `activity-card__streams-item-${ index }` } stream={ item } />
		) ) }
	</>
);

export default StreamsContent;
