/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import FormattedBlock from 'components/notes-formatted-block';

class ActivityDescription extends Component {
	trackContentLinkClick = ( {
		target: {
			dataset: { activity, section, intent },
		},
	} ) => {
		const params = { activity, section, intent };
		analytics.tracks.recordEvent( 'calypso_activitylog_item_click', params );
	};

	getRewindCredentialErrorMessage() {
		const { translate } = this.props;
		return translate(
			'Jetpack had some trouble connecting to your site, but that problem has been resolved.'
		);
	}

	isRewindCredentialError() {
		const {
			activity: { activityName, activityMeta },
			rewindIsActive,
		} = this.props;
		return (
			'rewind__backup_error' === activityName &&
			'bad_credentials' === activityMeta.errorCode &&
			rewindIsActive
		);
	}

	getPlanTextDescription() {
		const {
			activity: { activityDescription },
		} = this.props;

		// If backup failed due to invalid credentials but Rewind is now active means it was fixed.
		if ( this.isRewindCredentialError() ) {
			return this.getRewindCredentialErrorMessage();
		}
		/* There is no great way to generate a more valid React key here
        * but the index is probably sufficient because these sub-items
        * shouldn't be changing. */
		return activityDescription
			.map( part => {
				return part.children
					? part.children
							.reduce( ( accumulator, child ) => {
								return child.text ? accumulator + ' ' + child.text : accumulator + ' ' + child;
							}, '' )
							.trim()
					: part;
			} )
			.join( '' );
	}

	render() {
		const {
			activity: { activityName, activityDescription },
		} = this.props;

		// If backup failed due to invalid credentials but Rewind is now active means it was fixed.
		if ( this.isRewindCredentialError() ) {
			return this.getRewindCredentialErrorMessage();
		}

		return (
			<div
				className="activity-log-item__description-content"
				data-e2e-activity={ this.getPlanTextDescription() }
			>
				{ /* There is no great way to generate a more valid React key here
					 * but the index is probably sufficient because these sub-items
		 			 * shouldn't be changing. */
				activityDescription.map( ( part, i ) => {
					const { intent, section } = part;
					return (
						<FormattedBlock
							key={ i }
							content={ part }
							onClick={ this.trackContentLinkClick }
							meta={ { activity: activityName, intent, section } }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default localize( ActivityDescription );
