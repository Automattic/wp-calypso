/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { pick } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack/dialog';
import QuerySitePlans from 'components/data/query-site-plans';

class DisconnectJetpackButton extends Component {
	constructor( props ) {
		super( props );
		this.state = { dialogVisible: false };
	}

	handleClick = event => {
		event.preventDefault();
		const { isMock, recordGoogleEvent: recordGAEvent } = this.props;

		if ( isMock ) {
			return;
		}
		this.setState( { dialogVisible: true } );
		recordGAEvent( 'Jetpack', 'Clicked To Open Disconnect Jetpack Dialog' );
	};

	hideDialog = () => {
		const { recordGoogleEvent: recordGAEvent } = this.props;
		this.setState( { dialogVisible: false } );
		recordGAEvent( 'Jetpack', 'Clicked To Cancel Disconnect Jetpack Dialog' );
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
					isBroken={ false }
					siteId={ site.ID }
					redirect={ this.props.redirect }
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
};

DisconnectJetpackButton.defaultProps = {
	linkDisplay: true,
};

export default localize( DisconnectJetpackButton );
