/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import wrapWithClickOutside from 'react-click-outside';

/**
 * Internal dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getAutomatedTransferStatus,
	isAutomatedTransferTransferring,
} from 'state/automated-transfer/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class PluginAutomatedTransfer extends Component {

	static propTypes = {
		isTransferring: PropTypes.bool,
		plugin: PropTypes.object,
		transferState: PropTypes.string,
		translate: PropTypes.func,
	}

	static defaultProps = {
		plugin: {
			name: 'Plugin',
		},
	}

	state = {
		clickOutside: false,
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.transferState !== nextProps.transferState ) {
			this.setState( { clickOutside: false } );
		}
	}

	getNoticeText = ( pluginName = '' ) => {
		const { transferState, translate } = this.props;
		const { START, SETUP, LEAVING, CONFLICTS, COMPLETE } = transferStates;

		if ( this.state.clickOutside ) {
			return translate( "Don't leave quite yet! Just a bit longer." );
		}

		switch ( transferState ) {
			case START: return translate( 'Installing %(plugin)s…', { args: { plugin: pluginName } } );
			case SETUP : return translate( 'Now configuring your site. This may take a few minutes.' );
			case LEAVING: return translate( "Don't leave quite yet! Just a bit longer." );
			case CONFLICTS: return translate( 'Sorry, we found some conflicts to fix before proceding.' );
			case COMPLETE: return translate( 'Successfully installed %(plugin)s!', { args: { plugin: pluginName } } );
		}
	}

	getStatus = transferState => {
		const { CONFLICTS, COMPLETE } = transferStates;
		if ( this.state.clickOutside ) {
			return 'is-info';
		}
		switch ( transferState ) {
			case CONFLICTS: return 'is-error';
			case COMPLETE: return 'is-success';
			default: return 'is-info';
		}
	}

	getIcon = transferState => {
		const { CONFLICTS, COMPLETE } = transferStates;
		if ( this.state.clickOutside ) {
			return 'sync';
		}
		switch ( transferState ) {
			case CONFLICTS: return 'notice';
			case COMPLETE: return 'checkmark';
			default: return 'sync';
		}
	}

	handleClickOutside( event ) {
		const { transferState } = this.props;
		const { CONFLICTS, COMPLETE } = transferStates;
		if ( transferState && ! includes( [ CONFLICTS, COMPLETE ], transferState ) ) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.setState( { clickOutside: true } );
		}
	}

	render() {
		const { isTransferring, plugin, transferState, translate } = this.props;
		const { COMPLETE, CONFLICTS } = transferStates;

		if ( ! isTransferring && ! includes( [ COMPLETE, CONFLICTS ], transferState ) ) {
			return null;
		}

		return (
			<Notice
				icon={ this.getIcon( transferState ) }
				className="plugin-automated-transfer"
				showDismiss={ false }
				status={ this.getStatus( transferState ) }
				text={ this.getNoticeText( plugin.name ) }
			>
				{ CONFLICTS === transferState &&
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
	const transferState = getAutomatedTransferStatus( state, site );
	const isTransferring = isAutomatedTransferTransferring( state, site );
	return {
		isTransferring,
		transferState,
	};
};

export default connect( mapStateToProps )( localize( wrapWithClickOutside( PluginAutomatedTransfer ) ) );
