/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import Popover from 'components/popover/index';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import FormToggle from 'components/forms/form-toggle';

class ReaderEmailSubscriptionSettingsPopout extends Component {
	static displayName = 'ReaderEmailSubscriptionSettingsPopout';
	static propTypes = {
		feedId: PropTypes.number,
		siteId: PropTypes.number,
	};
	state = { showPopover: false };

	togglePopoverVisibility = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	}

	closePopover = () => {
		this.setState( { showPopover: false } );
	}

	savePopoutSpanRef = spanRef => {
		this.spanRef = spanRef;
	}

	render() {
		return (
			<div>
				<span
					className="reader-subscription-list-item__settings-menu"
					onClick={ this.togglePopoverVisibility }
					ref={ this.savePopoutSpanRef }
				>
					<Gridicon icon="cog" size={ 24 } />
					Settings
				</span>

				<Popover
					onClose={ this.props.onClose }
					isVisible={ this.state.showPopover }
					context={ this.spanRef }
					position={ 'bottom left' }
				>
					<h3><strong> Email me </strong></h3>
					<div>
						<span> New posts</span>
						<FormToggle />
					</div>
					<SegmentedControl>
						<ControlItem>
							Instant
						</ControlItem>
						<ControlItem>
							Daily
						</ControlItem>
						<ControlItem>
							Weekly
						</ControlItem>
					</SegmentedControl>
				</Popover>
			</div>
		);
	}
}

export default localize( ReaderEmailSubscriptionSettingsPopout );

