/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import Popover from 'components/popover';
import HappychatButton from 'components/happychat/button';
import { recordTracksEvent } from 'state/analytics/actions';

class SetupFooter extends Component {
	componentWillMount() {
		this.setState( { showPopover: false } );
	}

	togglePopover = () => this.setState( { showPopover: ! this.state.showPopover } );

	storePopoverLink = ref => this.popoverLink = ref;

	render() {
		const { translate } = this.props;

		return (
			<CompactCard className="credentials-setup-flow__footer">
				<a
					onClick={ this.togglePopover }
					ref={ this.storePopoverLink }
					className="credentials-setup-flow__footer-popover-link"
				>
					<Gridicon icon="help" size={ 18 } className="credentials-setup-flow__footer-popover-icon" />
					{ translate( 'Why do I need this?' ) }
				</a>
				<HappychatButton
					className="credentials-setup-flow__happychat-button"
					onClick={ this.props.happychatEvent }
				>
					<Gridicon icon="chat" />
					<span className="credentials-setup-flow__happychat-button-text">
						{ translate( 'Get help' ) }
					</span>
				</HappychatButton>
				<Popover
					context={ this.popoverLink }
					isVisible={ this.state.showPopover }
					onClose={ this.togglePopover }
					className="credentials-setup-flow__footer-popover"
					position="top"
				>
					{ translate(
						'These credentials are used to perform automatic actions ' +
						'on your server including backups and restores.'
					) }
				</Popover>
			</CompactCard>
		);
	}
}

export default connect( null, {
	happychatEvent: () => recordTracksEvent( 'rewind_credentials_get_help', {} ),
} )( localize( SetupFooter ) );
