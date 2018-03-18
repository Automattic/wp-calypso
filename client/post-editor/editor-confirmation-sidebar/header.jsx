/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as utils from 'lib/posts/utils';

class EditorConfirmationSidebarHeader extends PureComponent {
	static propTypes = {
		post: PropTypes.object,
	};

	renderPublishHeader() {
		const { translate } = this.props;

		return (
			<div className="editor-confirmation-sidebar__header">
				{ translate(
					'{{strong}}Almost there!{{/strong}} ' +
						'Double-check your settings, then ' +
						'use the big green button to publish!',
					{
						comment:
							'This string appears as the header for the confirmation sidebar ' +
							'when a user publishes a post.',
						components: {
							strong: <strong />,
						},
					}
				) }
			</div>
		);
	}

	renderScheduleHeader() {
		const { translate } = this.props;

		return (
			<div className="editor-confirmation-sidebar__header">
				{ translate(
					'{{strong}}Almost there!{{/strong}} ' +
						'Double-check your settings below, then ' +
						'use the big green button to schedule!',
					{
						comment:
							'This string appears as the header for the confirmation sidebar ' +
							'when a user schedules the publishing of a post.',
						components: {
							strong: <strong />,
						},
					}
				) }
			</div>
		);
	}

	render() {
		const isScheduled = utils.isFutureDated( this.props.post );

		if ( isScheduled ) {
			return this.renderScheduleHeader();
		}

		return this.renderPublishHeader();
	}
}

export default localize( EditorConfirmationSidebarHeader );
