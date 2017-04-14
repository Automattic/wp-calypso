/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { noop } from 'lodash';

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

	setSelected = text => () => {
		this.setState( { selected: text } );
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
					<Gridicon icon="cog" size={ 24 } />
					<span className="reader-subscription-list-item__settings-label">Settings</span>
				</span>

				<Popover
					onClose={ this.closePopover }
					isVisible={ this.state.showPopover }
					context={ this.spanRef }
					position={ 'bottom left' }
					className="reader-subscription-list-item__settings-menu-popout"
				>
					<div className="reader-subscription-list-item__email-popout-wrapper">
						<h3 className="reader-subscription-list-item__email-popout-header">
							{ translate( 'Email me' ) }
						</h3>
						<div className="reader-subscription-list-item__email-popout-toggle">
							{ translate( 'New posts' ) }
							<FormToggle
								onChange={ noop /* fire off dispatch */ }
								checked={ true /* get from selector*/ }
							/>
						</div>
						<SegmentedControl compact={ false }>
							<ControlItem
								selected={ this.state.selected === 'instant' }
								onClick={ this.setSelected( 'instant' ) }
							>
								{ translate( 'Instant' ) }
							</ControlItem>
							<ControlItem
								selected={ this.state.selected === 'daily' }
								onClick={ this.setSelected( 'daily' ) }
							>
								{ translate( 'Daily' ) }
							</ControlItem>
							<ControlItem
								selected={ this.state.selected === 'weekly' }
								onClick={ this.setSelected( 'weekly' ) }
							>
								{ translate( 'Weekly' ) }
							</ControlItem>
						</SegmentedControl>
						<div className="reader-subscription-list-item__email-popout-toggle">
							New comments
							<FormToggle
								onChange={ noop /* fire off dispatch */ }
								checked={ false /* get from selector*/ }
							/>
						</div>
					</div>
				</Popover>
			</div>
		);
	}
}

export default localize( ReaderEmailSubscriptionSettingsPopout );

