/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityCardActionBar from './action-bar';
import { Button } from '@automattic/components';
import Gridicon from 'components/gridicon';
import ActivityMedia from 'my-sites/activity/activity-log-item/activity-media';

// future work: collect these typings
interface ActivityMediaItem {
	available: boolean;
	medium_url: string;
	name: string;
	thumbnail_url: string;
}

interface ActivityStreamItem {
	activityMedia?: ActivityMediaItem;
	rewindId: string;
}

interface Props {
	rewindId: string;
	showActions: boolean;
	siteSlug: string;
	streams: ActivityStreamItem[];
}

const ActivityCardSteamsPreview: FunctionComponent< Props > = ( {
	rewindId,
	showActions,
	siteSlug,
	streams,
} ) => {
	const translate = useTranslate();
	const [ showPreview, setShowPreview ] = useState( false );

	const togglePreview = () => setShowPreview( ! showPreview );

	const onSpace = ( fn ) => ( event, fn ) => {
		if ( event.key === ' ' ) {
			return fn;
		}

		return () => null;
	};

	const renderToggleButton = () => (
		<Button
			compact
			borderless
			className="activity-card__see-content-link"
			onClick={ togglePreview }
			onKeyDown={ onSpace( togglePreview ) }
		>
			{ showPreview ? translate( 'Hide content' ) : translate( 'See content' ) }
			<Gridicon
				size={ 18 }
				icon={ showPreview ? 'chevron-up' : 'chevron-down' }
				className="activity-card__see-content-icon"
			/>
		</Button>
	);

	const renderActionBar = () => (
		<ActivityCardActionBar siteSlug={ siteSlug } rewindId={ rewindId } showActions={ showActions }>
			{ renderToggleButton() }
		</ActivityCardActionBar>
	);

	const renderPreview = () => {
		return streams.map( ( { activityMedia, rewindId } ) => {
			return (
				activityMedia &&
				activityMedia.available && (
					<div key={ rewindId } className="activity-card__streams-item">
						<div className="activity-card__streams-item-title">{ activityMedia.name }</div>
						<ActivityMedia
							name={ activityMedia.name }
							fullImage={ activityMedia.medium_url || activityMedia.thumbnail_url }
						/>
					</div>
				)
			);
		} );
	};

	return showPreview ? (
		<>
			{ renderActionBar() }
			{ renderPreview() }
			{ renderActionBar() }
		</>
	) : (
		renderActionBar()
	);
};

export default ActivityCardSteamsPreview;
