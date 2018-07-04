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
		toUpdate: PropTypes.object.isRequired,
		disable: PropTypes.bool,
		name: PropTypes.string,
		slug: PropTypes.string,
		version: PropTypes.string,
		type: PropTypes.string,
		updateType: PropTypes.string,

		linked: PropTypes.bool,
		goToPage: PropTypes.func,
		enqueueTheme: PropTypes.func,
		dismissTheme: PropTypes.func,

		// Plugin specific
		enqueue: PropTypes.func,
		dismiss: PropTypes.func,

		// Localize
		translate: PropTypes.func.isRequired,
	};

	handleEnqueue = () => this.props.enqueue( this.props.toUpdate );
	handleDismiss = () => this.props.dismiss( this.props.toUpdate );
	handleNameClick = () => this.props.goToPage( this.props.slug, this.props.type );

	render() {
		const { translate, name, version, type, updateType, disable, linked } = this.props;

		return (
			<Card className="activity-log-tasklist__task" compact>
				<ActivityIcon
					activityIcon={ 'plugin' === type || 'theme' === type ? `${ type }s` : 'my-sites' }
					activityStatus="warning"
				/>
				<span className="activity-log-tasklist__update-item">
					<div>
						<span className="activity-log-tasklist__update-text">
							{ linked ? (
								<Button borderless onClick={ this.handleNameClick }>
									{ name }
								</Button>
							) : (
								// Add button classes so unlinked names look the same.
								<span className="activity-log-tasklist__unlinked button is-borderless">
									{ name }
								</span>
							) }
						</span>
						<span className="activity-log-tasklist__update-bullet">&bull;</span>
						<span className="activity-log-tasklist__update-version">{ version }</span>
					</div>
					<div className="activity-log-tasklist__update-type">{ updateType }</div>
				</span>
				<span className="activity-log-tasklist__update-action">
					<SplitButton
						compact
						primary
						label={ translate( 'Update' ) }
						onClick={ this.handleEnqueue }
						disabled={ disable }
					>
						<PopoverMenuItem icon="trash" onClick={ this.handleDismiss }>
							{ translate( 'Dismiss' ) }
						</PopoverMenuItem>
					</SplitButton>
				</span>
			</Card>
		);
	}
}

export default localize( ActivityLogTaskUpdate );
