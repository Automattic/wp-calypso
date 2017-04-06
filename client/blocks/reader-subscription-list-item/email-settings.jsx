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
import FormToggle from 'components/forms/form-toggle/compact';

class ReaderEmailSubscriptionSettingsPopout extends Component {
	static displayName = 'ReaderEmailSubscriptionSettingsPopout';
	static propTypes = {
		feedId: PropTypes.number,
		siteId: PropTypes.number,
	};
	state = {
		showPopover: false,
	};

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
		const { translate } = this.props;

		return (
			<div>
				<span
					className="reader-subscription-list-item__settings-menu"
					onClick={ this.togglePopoverVisibility }
					ref={ this.savePopoutSpanRef }
				>
					<Gridicon icon="cog" size={ 20 } />
					Settings
				</span>

				<Popover
					onClose={ this.props.onClose }
					isVisible={ this.state.showPopover }
					context={ this.spanRef }
					position={ 'bottom left' }
				>
					<div className="reader-subscription-list-item__email-popout-wrapper">
						<h3 className="reader-subscription-list-item__email-popout-header"> { translate( 'Email me' ) } </h3>
						<div>
							<span> { translate( 'New posts' ) } </span>
							<FormToggle />
						</div>
						<SegmentedControl compact={ true }>
							<ControlItem>
								{ translate( 'Instant' ) }
							</ControlItem>
							<ControlItem>
								{ translate( 'Daily' ) }
							</ControlItem>
							<ControlItem>
								{ translate( 'Weekly' ) }
							</ControlItem>
						</SegmentedControl>
						<div>
							<span> New comments</span>
							<FormToggle />
						</div>
					</div>
				</Popover>
			</div>
		);
	}
}

export default localize( ReaderEmailSubscriptionSettingsPopout );

