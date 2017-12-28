/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { pick } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import DisconnectJetpackDialog from 'client/blocks/disconnect-jetpack/dialog';
import QuerySitePlans from 'client/components/data/query-site-plans';
import {
	recordGoogleEvent as recordGoogleEventAction,
	recordTracksEvent as recordTracksEventAction,
} from 'client/state/analytics/actions';

class DisconnectJetpackButton extends Component {
	state = { dialogVisible: false };

	handleClick = () => {
		const { isMock, recordGoogleEvent, recordTracksEvent } = this.props;

		if ( isMock ) {
			return;
		}
		this.setState( { dialogVisible: true } );
		recordGoogleEvent( 'Jetpack', 'Clicked To Open Disconnect Jetpack Dialog' );
		recordTracksEvent( 'calypso_jetpack_disconnect_start' );
	};

	hideDialog = () => {
		const { recordGoogleEvent } = this.props;
		this.setState( { dialogVisible: false } );
		recordGoogleEvent( 'Jetpack', 'Clicked To Cancel Disconnect Jetpack Dialog' );
	};

	render() {
		const { linkDisplay, site, text, translate } = this.props;
		const buttonPropsList = [
			'borderless',
			'busy',
			'compact',
			'disabled',
			'href',
			'primary',
			'rel',
			'scary',
			'target',
			'type',
		];

		return (
			<Button
				{ ...pick( this.props, buttonPropsList ) }
				borderless={ linkDisplay }
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				className="disconnect-jetpack-button"
				compact
				id={ `disconnect-jetpack-${ site.ID }` }
				onClick={ this.handleClick }
				scary
			>
				{ text ||
					translate( 'Disconnect', {
						context: 'Jetpack: Action user takes to disconnect Jetpack site from .com',
					} ) }
				<QuerySitePlans siteId={ site.ID } />
				<DisconnectJetpackDialog
					isVisible={ this.state.dialogVisible }
					onClose={ this.hideDialog }
					isBroken
					siteId={ site.ID }
					disconnectHref={ this.props.redirect }
				/>
			</Button>
		);
	}
}

DisconnectJetpackButton.propTypes = {
	site: PropTypes.object.isRequired,
	redirect: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	linkDisplay: PropTypes.bool,
	isMock: PropTypes.bool,
	text: PropTypes.string,
	recordGoogleEvent: PropTypes.func.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
};

DisconnectJetpackButton.defaultProps = {
	linkDisplay: true,
};

export default connect( null, {
	recordGoogleEvent: recordGoogleEventAction,
	recordTracksEvent: recordTracksEventAction,
} )( localize( DisconnectJetpackButton ) );
