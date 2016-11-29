/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

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
				comment: 'Installing plugin…',
			} );
			case 'setup': return translate( 'Now configuring your site. This may take a few minutes.' );
			case 'leaving': return translate( "Don't leave quite yet! Just a bit longer." );
			case 'conflicts': return translate( 'Sorry, we found some conflicts to fix before proceding.' );
			case 'complete': return translate( 'Successfully installed %s!', {
				args: pluginName,
				context: 'Successfully installed plugin!',
			} );
		}
	}

	setStatus = transferStep => {
		switch ( transferStep ) {
			case 'conflicts': return 'is-error';
			case 'complete': return 'is-success';
			default: return 'is-info';
		}
	}

	setIcon = transferStep => {
		switch ( transferStep ) {
			case 'conflicts': return 'notice';
			case 'complete': return 'checkmark';
			default: return 'sync';
		}
	}

	testChangeState = () => {
		const { transferStep } = this.state;
		switch ( transferStep ) {
			case 'start': this.setState( { transferStep: 'setup' } ); break;
			case 'setup': this.setState( { transferStep: 'leaving' } ); break;
			case 'leaving': this.setState( { transferStep: 'conflicts' } ); break;
			case 'conflicts': this.setState( { transferStep: 'complete' } ); break;
			case 'complete': this.setState( { transferStep: 'start' } ); break;
		}
	}

	render() {
		const { plugin, translate } = this.props;
		const { transferStep } = this.state;

		return (
			<Notice
				icon={ this.setIcon( transferStep ) }
				className="plugin-automated-transfer"
				showDismiss={ false }
				status={ this.setStatus( transferStep ) }
				text={ this.setNoticeText( plugin.name ) }
			>
				<NoticeAction href="#" onClick={ this.testChangeState }>
					{ transferStep === 'conflicts'
							? translate( 'View Conflicts' )
							: 'Test Change State' // TESTING
					}
				</NoticeAction>
			</Notice>
		);
	}

}

export default localize( PluginAutomatedTransfer );
