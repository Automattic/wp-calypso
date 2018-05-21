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
import Button from 'components/button';
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
		enqueuePlugin: PropTypes.func,
		dismissPlugin: PropTypes.func,
		goToPlugin: PropTypes.func,

		// Localize
		translate: PropTypes.func.isRequired,
	};

	handlePluginEnqueue = () => this.props.enqueuePlugin( this.props.plugin );
	handlePluginDismiss = () => this.props.dismissPlugin( this.props.plugin.slug );
	handlePluginNameClick = () => this.props.goToPlugin( this.props.plugin.slug );

	render() {
		const { translate, plugin, disable } = this.props;

		return (
			<Card className="activity-log-tasklist__task" compact>
				<ActivityIcon activityIcon="plugins" activityStatus="warning" />
				<span className="activity-log-tasklist__update-item">
					<div>
						<span className="activity-log-tasklist__update-text">
							{ translate( 'Update available for {{plugin/}}', {
								components: {
									plugin: (
										<Button borderless onClick={ this.handlePluginNameClick }>
											{ plugin.name }
										</Button>
									),
								},
							} ) }
						</span>
						<span className="activity-log-tasklist__update-bullet">&bull;</span>
						<span className="activity-log-tasklist__update-version">
							{ plugin.update.new_version }
						</span>
					</div>
					<div className="activity-log-tasklist__update-type">
						{ translate( 'Plugin update available' ) }
					</div>
				</span>
				<span className="activity-log-tasklist__update-action">
					<SplitButton
						compact
						primary
						label={ translate( 'Update' ) }
						onClick={ this.handlePluginEnqueue }
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
