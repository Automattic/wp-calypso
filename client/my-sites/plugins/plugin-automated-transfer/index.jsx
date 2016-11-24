/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

class PluginAutomatedTransfer extends Component {

	static propTypes = {
		translate: PropTypes.func,
		plugin: PropTypes.object,
	}

	static defaultProps = {
		plugin: {
			name: 'Plugin',
		},
	}

	state = {
		transferStep: 'start',
	}

	setNoticeText = ( pluginName = '' ) => {
		const { translate } = this.props;
		const { transferStep } = this.state;

		switch ( transferStep ) {
			case 'start': return translate( 'Installing %s…', {
				args: pluginName,
				context: 'Installing plugin…',
			} );
			case 'setup': return translate( 'Now configuring your site. This may take a few minutes.' );
			case 'leaving': return translate( 'Don\'t leave quite yet! Just a bit longer.' );
			case 'complete': return translate( 'Successfully installed %s!', {
				args: pluginName,
				context: 'Successfully installed plugin!',
			} );
		}
	}

	testChangeState = () => {
		const { transferStep } = this.state;
		switch ( transferStep ) {
			case 'start': this.setState( { transferStep: 'setup' } ); break;
			case 'setup': this.setState( { transferStep: 'leaving' } ); break;
			case 'leaving': this.setState( { transferStep: 'complete' } ); break;
			case 'complete': this.setState( { transferStep: 'start' } ); break;
		}
	}

	render() {
		const { plugin } = this.props;
		const { transferStep } = this.state;
		return (
			<Notice
				status={ transferStep === 'complete' ? 'is-success' : 'is-info' }
				showDismiss={ false }
				icon={ transferStep === 'complete' ? 'checkmark' : 'sync' }
				className="plugin-automated-transfer"
			>
				{ this.setNoticeText( plugin.name ) }

				<a onClick={ this.testChangeState }>
					[Change State]
				</a>
			</Notice>
		);
	}

}

export default localize( PluginAutomatedTransfer );
