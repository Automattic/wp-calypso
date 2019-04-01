/** @format */

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

/**
 * Style dependencies
 */
import './setup-footer.scss';

class SetupFooter extends Component {
	state = { isPopoverVisible: false };

	popoverContext = React.createRef();

	togglePopover = () => this.setState( { isPopoverVisible: ! this.state.isPopoverVisible } );
	hidePopover = () => this.setState( { isPopoverVisible: false } );

	render() {
		const { happychatIsAvailable, translate } = this.props;
		const { isPopoverVisible } = this.state;

		return (
			<CompactCard className="credentials-setup-flow__footer">
				<Button ref={ this.popoverContext } onClick={ this.togglePopover } borderless>
					<Gridicon icon="help" />
					{ translate( "Need help finding your site's server credentials?" ) }
				</Button>
				{ isPopoverVisible && (
					<Popover
						isVisible
						context={ this.popoverContext.current }
						onClose={ this.hidePopover }
						className="credentials-setup-flow__footer-popover"
						position="top"
					>
						{ translate(
							'You can normally get your credentials from your hosting provider. ' +
								'Their website should explain how to get or create the credentials you need.'
						) }
					</Popover>
				) }

				{ happychatIsAvailable && (
					<HappychatButton onClick={ this.props.happychatEvent }>
						<Gridicon icon="chat" />
						{ translate( 'Get help' ) }
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
