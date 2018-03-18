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
import HappychatButton from 'components/happychat/button';
import { recordTracksEvent } from 'state/analytics/actions';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import Button from 'components/button';
import Popover from 'components/popover';

class SetupFooter extends Component {
	state = {
		isPopoverVisible: false,
		popoverContext: null,
	};

	setPopoverContext = popoverContext => {
		if ( popoverContext ) {
			this.setState( { popoverContext } );
		}
	};
	togglePopover = () => this.setState( { isPopoverVisible: ! this.state.isPopoverVisible } );
	hidePopover = () => this.setState( { isPopoverVisible: false } );

	render() {
		const { happychatIsAvailable, translate } = this.props;
		const { isPopoverVisible, popoverContext } = this.state;

		return (
			<CompactCard className="credentials-setup-flow__footer">
				<Button
					ref={ this.setPopoverContext }
					onClick={ this.togglePopover }
					borderless
				>
					<Gridicon icon="help" />
					<span className="credentials-setup-flow__help-button-text">
						{
							translate( "Need help finding your site's server credentials?" )
						}
					</span>
				</Button>
				<Popover
					context={ popoverContext }
					isVisible={ isPopoverVisible }
					onClose={ this.hidePopover }
					className="credentials-setup-flow__popover"
					position="top"
				>
					{
						translate( 'You can normally get your credentials from your hosting provider. ' +
							'Their website should explain how to get or create the credentials you need.' )
					}
				</Popover>

				{ happychatIsAvailable && (
					<HappychatButton
						onClick={ this.props.happychatEvent }
					>
						<Gridicon icon="chat" />
						<span className="credentials-setup-flow__happychat-button-text">
							{ translate( 'Get help' ) }
						</span>
					</HappychatButton>
				) }
			</CompactCard>
		);
	}
}

export default connect(
	state => ( {
		happychatIsAvailable: isHappychatAvailable( state ),
	} ),
	{
		happychatEvent: () => recordTracksEvent( 'calypso_rewind_credentials_get_help' ),
	}
)( localize( SetupFooter ) );
