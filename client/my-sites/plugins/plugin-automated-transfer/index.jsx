/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import wrapWithClickOutside from 'react-click-outside';

/**
 * Internal dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';
import {
	getAutomatedTransferStatus,
	isAutomatedTransferActive,
	isAutomatedTransferFailed,
} from 'state/automated-transfer/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import WpAdminAutoLogin from 'components/wpadmin-auto-login';
import { requestSite } from 'state/sites/actions';

/**
 * Style dependencies
 */
import './style.scss';

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

	UNSAFE_componentWillMount() {
		const { COMPLETE } = transferStates;
		const { isTransferring, isFailedTransfer, transferState } = this.props;

		if ( COMPLETE === transferState ) {
			this.setState( { transferComplete: true } );
		} else if ( isTransferring || isFailedTransfer ) {
			this.setState( { shouldDisplay: true } );
		}
	}

	componentWillUnmount() {
		clearInterval( this.interval );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;
		const { COMPLETE } = transferStates;
		const { transferComplete } = this.state;
		const newState = {};

		if ( this.props.transferState !== nextProps.transferState ) {
			newState.clickOutside = false;
		}

		if ( COMPLETE === nextProps.transferState ) {
			this.interval = this.interval || setInterval( () => this.props.requestSite( siteId ), 1000 );

			newState.transferComplete = true;
			if ( ! transferComplete ) {
				newState.shouldDisplay = true;
			}
		} else if ( ! transferComplete ) {
			newState.shouldDisplay = nextProps.isTransferring || nextProps.isFailedTransfer;
		}

		this.setState( newState );
	}

	getNoticeText = () => {
		const { START, CONFLICTS, FAILURE } = transferStates;
		const { plugin, transferState, translate } = this.props;
		const { clickOutside, transferComplete } = this.state;

		if ( clickOutside ) {
			return translate( "Don't leave quite yet! Just a bit longer." );
		}
		if ( transferComplete ) {
			return translate( 'Activating %(plugin)s…', { args: { plugin: plugin.name } } );
		}
		switch ( transferState ) {
			case START:
				return translate( 'Installing %(plugin)s…', { args: { plugin: plugin.name } } );
			case CONFLICTS:
				return translate( 'Sorry, we found some conflicts to fix before proceeding.' );
			case FAILURE:
				return translate(
					'There was a problem installing the plugin. Please try again in a few minutes.'
				);
		}
	};

	getStatus = () => {
		const { isFailedTransfer } = this.props;
		const { clickOutside } = this.state;

		if ( clickOutside ) {
			return 'is-info';
		}
		if ( isFailedTransfer ) {
			return 'is-error';
		}
		return 'is-info';
	};

	getIcon = () => {
		const { isFailedTransfer } = this.props;
		const { clickOutside } = this.state;

		if ( clickOutside ) {
			return 'sync';
		}
		if ( isFailedTransfer ) {
			return 'notice';
		}
		return 'sync';
	};

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
			<div>
				<Notice
					icon={ this.getIcon() }
					className="plugin-automated-transfer__notice"
					showDismiss={ false }
					status={ this.getStatus() }
					text={ this.getNoticeText() }
				>
					{ ! transferComplete && CONFLICTS === transferState && (
						<NoticeAction href="#">
							{ translate( 'View Conflicts', {
								comment:
									'Conflicts arose during an Automated Transfer started by a plugin install.',
							} ) }
						</NoticeAction>
					) }
				</Notice>
				{ this.state.transferComplete && <WpAdminAutoLogin site={ this.props.site } /> }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		transferState: getAutomatedTransferStatus( state, siteId ),
		isTransferring: isAutomatedTransferActive( state, siteId ),
		isFailedTransfer: isAutomatedTransferFailed( state, siteId ),
		site: getSite( state, siteId ),
	};
};

export default connect( mapStateToProps, {
	requestSite,
} )( localize( wrapWithClickOutside( PluginAutomatedTransfer ) ) );
