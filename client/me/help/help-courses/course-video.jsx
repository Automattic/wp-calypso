/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import Card from 'components/card';

export default localize( ( props ) => {
	const {
		title,
		description,
		date,
		youtubeId
	} = props;

	return (
		<div className="help-courses__course-video">
			<div className="help-courses__course-video-embed">
				<iframe
					className="help-courses__course-video-embed-iframe"
					src={ `https://www.youtube.com/embed/${ youtubeId }?rel=0&showinfo=0` }
					allowFullScreen />
			</div>
			<Card compact>
				<h1 className="help-courses__course-video-title">{ title }</h1>
				<p className="help-courses__course-video-description">{ description }</p>
			</Card>
			<Card compact className="help-courses__course-video-date">
				<Gridicon className="help-courses__course-video-date-icon" icon="time" size={ 18 } />
				{ date.fromNow() }
			</Card>
		</div>
	);
} );
