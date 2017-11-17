/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import Popover from 'components/popover';

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

export default localize( SetupFooter );
