/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
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
		shouldDisplay: false,
		transferComplete: false,
	};

	componentWillMount() {
		const { COMPLETE, CONFLICTS } = transferStates;
		const { isTransferring, transferState } = this.props;

		if ( COMPLETE === transferState ) {
			this.setState( { transferComplete: true } );
		} else if ( isTransferring || CONFLICTS === transferState ) {
			this.setState( { shouldDisplay: true } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { COMPLETE, CONFLICTS } = transferStates;
		const { transferComplete } = this.state;
		const newState = {};

		if ( this.props.transferState !== nextProps.transferState ) {
			newState.clickOutside = false;
		}

		if ( COMPLETE === nextProps.transferState ) {
			newState.transferComplete = true;
			if ( ! transferComplete ) {
				newState.shouldDisplay = true;
			}
		} else if ( ! transferComplete ) {
			newState.shouldDisplay = nextProps.isTransferring || CONFLICTS === nextProps.transferState;
		}

		this.setState( newState );
	}

	getNoticeText = () => {
		const { START, SETUP, CONFLICTS } = transferStates;
		const { plugin, transferState, translate } = this.props;
		const { clickOutside, transferComplete } = this.state;

		if ( clickOutside ) {
			return translate( "Don't leave quite yet! Just a bit longer." );
		}
		if ( transferComplete ) {
			return translate( 'Successfully installed %(plugin)s!', { args: { plugin: plugin.name } } );
		}
		switch ( transferState ) {
			case START: return translate( 'Installing %(plugin)s…', { args: { plugin: plugin.name } } );
			case SETUP : return translate( 'Now configuring your site. This may take a few minutes.' );
			case CONFLICTS: return translate( 'Sorry, we found some conflicts to fix before proceeding.' );
		}
	}

	getStatus = () => {
		const { CONFLICTS } = transferStates;
		const { transferState } = this.props;
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

	getIcon = () => {
		const { CONFLICTS } = transferStates;
		const { transferState } = this.props;
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
		if ( this.props.isTransferring && ! this.state.transferComplete ) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.setState( { clickOutside: true } );
		}
	}

	render() {
		const { CONFLICTS } = transferStates;
		const { transferState, translate } = this.props;
		const { shouldDisplay, transferComplete } = this.state;

		if ( ! shouldDisplay ) {
			return null;
		}

		return (
			<Notice
				icon={ this.getIcon() }
				className="plugin-automated-transfer"
				showDismiss={ false }
				status={ this.getStatus() }
				text={ this.getNoticeText() }
			>
				{ ! transferComplete && CONFLICTS === transferState &&
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
