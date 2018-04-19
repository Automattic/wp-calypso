/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import Card from 'components/card';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';

class ActivityLogTaskUpdate extends Component {
	static propTypes = {
		plugin: PropTypes.shape( {
			id: PropTypes.string,
			slug: PropTypes.string,
			update: PropTypes.shape( {
				new_version: PropTypes.string,
			} ),
			name: PropTypes.string,
		} ).isRequired,
		disable: PropTypes.bool,
		updatePlugin: PropTypes.func,
		dismissPlugin: PropTypes.func,

		// Localize
		translate: PropTypes.func.isRequired,
	};

	handlePluginUpdate = () => this.props.updatePlugin( this.props.plugin );
	handlePluginDismiss = () => this.props.dismissPlugin( this.props.plugin.slug );

	render() {
		const { translate, plugin, disable } = this.props;

		return (
			<Card className="activity-log-tasklist__task" compact>
				<ActivityIcon activityIcon="plugins" activityStatus="warning" />
				<span className="activity-log-tasklist__update-item">
					<span className="activity-log-tasklist__update-text">
						{ translate( 'Update available for %(pluginName)s', {
							args: { pluginName: plugin.name },
						} ) }
					</span>
					<span className="activity-log-tasklist__update-bullet">&bull;</span>
					<span className="activity-log-tasklist__update-version">
						{ plugin.update.new_version }
					</span>
				</span>
				<span className="activity-log-tasklist__update-action">
					<SplitButton
						compact
						primary
						label={ translate( 'Update' ) }
						onClick={ this.handlePluginUpdate }
						disabled={ disable }
					>
						<PopoverMenuItem icon="trash" onClick={ this.handlePluginDismiss }>
							{ translate( 'Dismiss' ) }
						</PopoverMenuItem>
					</SplitButton>
				</span>
			</Card>
		);
	}
}

export default localize( ActivityLogTaskUpdate );
