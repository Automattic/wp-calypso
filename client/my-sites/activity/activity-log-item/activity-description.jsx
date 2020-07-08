/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import FormattedBlock from 'components/notes-formatted-block';

class ActivityDescription extends Component {
	trackContentLinkClick = ( {
		target: {
			dataset: { activity, section, intent },
		},
	} ) => {
		const params = { activity, section, intent };
		recordTracksEvent( 'calypso_activitylog_item_click', params );
	};

	render() {
		const {
			activity: { activityName, activityDescription, activityMeta },
			translate,
			rewindIsActive,
		} = this.props;

		// If backup failed due to invalid credentials but Rewind is now active means it was fixed.
		if (
			'rewind__backup_error' === activityName &&
			'bad_credentials' === activityMeta.errorCode &&
			rewindIsActive
		) {
			return translate(
				'Jetpack had some trouble connecting to your site, but that problem has been resolved.'
			);
		}

		/* There is no great way to generate a more valid React key here
		 * but the index is probably sufficient because these sub-items
		 * shouldn't be changing. */
		return activityDescription.map( ( part, i ) => {
			const { intent, section } = part;
			return (
				<FormattedBlock
					key={ i }
					content={ part }
					onClick={ this.trackContentLinkClick }
					meta={ { activity: activityName, intent, section } }
				/>
			);
		} );
	}
}

export default localize( ActivityDescription );
