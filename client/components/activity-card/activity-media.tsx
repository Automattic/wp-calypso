/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

interface Props {
	icon?: string;
	thumbnail?: string;
	fullImage?: string;
	name: string;
}

const ActivityMedia: FunctionComponent< Props > = ( { icon, thumbnail, fullImage, name } ) => (
	<div className="activity-card__activity-media">
		{ icon && <Gridicon icon={ icon } size={ 48 } /> }
		{ thumbnail && (
			<img src={ thumbnail } alt={ name } className="activity-card__activity-media-thumbnail" />
		) }
		{ fullImage && (
			<img src={ fullImage } alt={ name } className="activity-card__activity-media-full-width" />
		) }
	</div>
);

export default ActivityMedia;
