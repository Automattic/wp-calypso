/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class PluginAutomatedTransfer extends Component {

	static propTypes = {
		plugin: PropTypes.object,
		transferStep: PropTypes.string,
		translate: PropTypes.func,
	}

	static defaultProps = {
		plugin: {
			name: 'Plugin',
		},
	}

	getNoticeText = ( pluginName = '' ) => {
		const { transferStep, translate } = this.props;

		switch ( transferStep ) {
			case 'start': return translate( 'Installing %s…', { args: pluginName } );
			case 'setup': return translate( 'Now configuring your site. This may take a few minutes.' );
			case 'leaving': return translate( "Don't leave quite yet! Just a bit longer." );
			case 'conflicts': return translate( 'Sorry, we found some conflicts to fix before proceding.' );
			case 'complete': return translate( 'Successfully installed %s!', { args: pluginName } );
		}
	}

	getStatus = transferStep => {
		switch ( transferStep ) {
			case 'conflicts': return 'is-error';
			case 'complete': return 'is-success';
			default: return 'is-info';
		}
	}

	getIcon = transferStep => {
		switch ( transferStep ) {
			case 'conflicts': return 'notice';
			case 'complete': return 'checkmark';
			default: return 'sync';
		}
	}

	render() {
		const { plugin, transferStep, translate } = this.props;

		if ( ! transferStep ) {
			return null;
		}

		return (
			<Notice
				icon={ this.getIcon( transferStep ) }
				className="plugin-automated-transfer"
				showDismiss={ false }
				status={ this.getStatus( transferStep ) }
				text={ this.getNoticeText( plugin.name ) }
			>
				{ transferStep === 'conflicts' &&
					<NoticeAction href="#">
						{ translate( 'View Conflicts' ) }
					</NoticeAction>
				}
			</Notice>
		);
	}

}

const mapStateToProps = state => {
	const site = getSelectedSiteId( state );
	const status = getAutomatedTransferStatus( state, site );
	return {
		transferStep: status,
	};
};

export default connect( mapStateToProps )( localize( PluginAutomatedTransfer ) );
