/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { omit } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DisconnectJetpackDialog from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-dialog';
import analytics from 'lib/analytics';

class DisconnectJetpackButton extends Component {
	constructor( props ) {
		super( props );

		this.handleClick = this.handleClick.bind( this );
	}

	handleClick( event ) {
		event.preventDefault();
		if ( this.props.isMock ) {
			return;
		}

		this.refs.dialog.open();
		analytics.ga.recordEvent( 'Jetpack', 'Clicked To Open Disconnect Jetpack Dialog' );
	}

	render() {
		const { site, redirect, linkDisplay, translate } = this.props;

		const omitProps = [ 'site', 'redirect', 'isMock', 'linkDisplay', 'text', 'moment', 'numberFormat', 'translate' ];
		const buttonProps = {
			...omit( this.props, omitProps ),
			id: `disconnect-jetpack-${ site.ID }`,
			className: 'disconnect-jetpack-button',
			compact: true,
			disabled: this.props.disabled,
			scary: true,
			borderless: linkDisplay,
			onClick: this.handleClick
		};

		let { text } = this.props;

		if ( ! text ) {
			text = translate( 'Disconnect', {
				context: 'Jetpack: Action user takes to disconnect Jetpack site from .com'
			} );
		}

		return <Button { ...buttonProps }>
			{ text }
			<DisconnectJetpackDialog site={ site } ref="dialog" redirect={ redirect } />
		</Button>;
	}
}

DisconnectJetpackButton.propTypes = {
	site: PropTypes.object.isRequired,
	redirect: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	linkDisplay: PropTypes.bool,
	isMock: PropTypes.bool,
	text: PropTypes.string
};

DisconnectJetpackButton.defaultProps = {
	linkDisplay: true
};

export default localize( DisconnectJetpackButton );
