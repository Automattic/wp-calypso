/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_STATUS } from 'state/automated-transfer/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class PluginAutomatedTransfer extends Component {

	static propTypes = {
		plugin: PropTypes.object,
		status: PropTypes.string,
		translate: PropTypes.func,
	}

	static defaultProps = {
		plugin: {
			name: 'Plugin',
		},
	}

	getNoticeText = ( pluginName = '' ) => {
		const { status, translate } = this.props;
		const { START, SETUP, LEAVING, CONFLICTS, COMPLETE } = AUTOMATED_TRANSFER_STATUS;

		switch ( status ) {
			case START: return translate( 'Installing %(plugin)s…', { args: { plugin: pluginName } } );
			case SETUP : return translate( 'Now configuring your site. This may take a few minutes.' );
			case LEAVING: return translate( "Don't leave quite yet! Just a bit longer." );
			case CONFLICTS: return translate( 'Sorry, we found some conflicts to fix before proceding.' );
			case COMPLETE: return translate( 'Successfully installed %(plugin)s!', { args: { plugin: pluginName } } );
		}
	}

	getStatus = status => {
		const { CONFLICTS, COMPLETE } = AUTOMATED_TRANSFER_STATUS;
		switch ( status ) {
			case CONFLICTS: return 'is-error';
			case COMPLETE: return 'is-success';
			default: return 'is-info';
		}
	}

	getIcon = status => {
		const { CONFLICTS, COMPLETE } = AUTOMATED_TRANSFER_STATUS;
		switch ( status ) {
			case CONFLICTS: return 'notice';
			case COMPLETE: return 'checkmark';
			default: return 'sync';
		}
	}

	render() {
		const { plugin, status, translate } = this.props;
		const { CONFLICTS } = AUTOMATED_TRANSFER_STATUS;

		if ( ! status || ! includes( AUTOMATED_TRANSFER_STATUS, status ) ) {
			return null;
		}

		return (
			<Notice
				icon={ this.getIcon( status ) }
				className="plugin-automated-transfer"
				showDismiss={ false }
				status={ this.getStatus( status ) }
				text={ this.getNoticeText( plugin.name ) }
			>
				{ CONFLICTS === status &&
					<NoticeAction href="#">
						{ translate( 'View Conflicts', {
							comment: 'Conflicts arose during an Automated Transfer started by a plugin install.',
						} ) }
					</NoticeAction>
				}
			</Notice>
		);
	}

}

const mapStateToProps = state => {
	const site = getSelectedSiteId( state );
	const status = getAutomatedTransferStatus( state, site );
	return { status };
};

export default connect( mapStateToProps )( localize( PluginAutomatedTransfer ) );
