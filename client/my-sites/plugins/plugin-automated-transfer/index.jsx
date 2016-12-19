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
	};

	static defaultProps = {
		plugin: {
			name: 'Plugin',
		},
	};

	state = {
		clickOutside: false,
		shouldDisplay: true,
		transferComplete: false,
	};

	componentWillMount() {
		if ( transferStates.COMPLETE === this.props.transferState ) {
			this.setState( { shouldDisplay: false } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { COMPLETE, CONFLICTS } = transferStates;
		const { isTransferring, transferState } = nextProps;

		if ( COMPLETE === transferState ) {
			this.setState( { transferComplete: true } );
		}
		if ( this.props.transferState !== transferState ) {
			this.setState( { clickOutside: false } );
		}
		if (
			this.state.shouldDisplay &&
			! isTransferring &&
			! includes( [ COMPLETE, CONFLICTS ], transferState )
		) {
			this.setState( { shouldDisplay: false } );
		}
	}

	getNoticeText = ( pluginName = '' ) => {
		const { transferState, translate } = this.props;
		const { clickOutside, transferComplete } = this.state;
		const { START, SETUP, CONFLICTS } = transferStates;

		if ( clickOutside ) {
			return translate( "Don't leave quite yet! Just a bit longer." );
		}
		if ( transferComplete ) {
			return translate( 'Successfully installed %(plugin)s!', { args: { plugin: pluginName } } );
		}
		switch ( transferState ) {
			case START: return translate( 'Installing %(plugin)s…', { args: { plugin: pluginName } } );
			case SETUP : return translate( 'Now configuring your site. This may take a few minutes.' );
			case CONFLICTS: return translate( 'Sorry, we found some conflicts to fix before proceding.' );
		}
	}

	getStatus = transferState => {
		const { CONFLICTS } = transferStates;
		const { clickOutside, transferComplete } = this.state;

		if ( clickOutside ) {
			return 'is-info';
		}
		if ( transferComplete ) {
			return 'is-success';
		}
		if ( CONFLICTS === transferState ) {
			return 'is-error';
		}
		return 'is-info';
	}

	getIcon = transferState => {
		const { CONFLICTS } = transferStates;
		const { clickOutside, transferComplete } = this.state;

		if ( clickOutside ) {
			return 'sync';
		}
		if ( transferComplete ) {
			return 'checkmark';
		}
		if ( CONFLICTS === transferState ) {
			return 'notice';
		}
		return 'sync';
	}

	handleClickOutside( event ) {
		if ( this.props.isTransferring ) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.setState( { clickOutside: true } );
		}
	}

	render() {
		const { plugin, transferState, translate } = this.props;
		const { shouldDisplay } = this.state;
		const { CONFLICTS } = transferStates;

		if ( ! shouldDisplay ) {
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
