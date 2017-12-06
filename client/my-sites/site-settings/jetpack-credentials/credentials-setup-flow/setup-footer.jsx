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

class SetupFooter extends Component {
	componentWillMount() {
		this.setState( { showPopover: false } );
	}

	render() {
		const { happychatAvailable, translate } = this.props;

		return (
			<CompactCard className="credentials-setup-flow__footer">
				{ happychatAvailable
					? <HappychatButton
						className="credentials-setup-flow__happychat-button"
						onClick={ this.props.happychatEvent }
					>
						<Gridicon icon="chat" />
						<span className="credentials-setup-flow__happychat-button-text">
							{ translate( 'Get help' ) }
						</span>
					</HappychatButton>
					: <a href="/help/contact" className="credentials-setup-flow__help-button">
						<Gridicon icon="help" />
						<span className="credentials-setup-flow__help-button-text">
							{ translate( 'Get help' ) }
						</span>
					</a>
				}

			</CompactCard>
		);
	}
}

const mapStateToProps = state => ( {
	isHappychatAvailable: isHappychatAvailable( state ),
} );

const mapDispatchToProps = () => ( {
	happychatEvent: () => recordTracksEvent( 'rewind_credentials_get_help' ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( SetupFooter ) );
