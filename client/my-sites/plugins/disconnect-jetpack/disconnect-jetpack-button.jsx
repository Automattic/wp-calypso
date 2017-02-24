/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { omit } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DisconnectJetpackDialog from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-dialog';
import { isSiteAutomatedTransfer } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class DisconnectJetpackButton extends Component {
	handleClick = ( event ) => {
		event.preventDefault();
		if ( this.props.isMock ) {
			return;
		}

		if ( this.refs.dialog ) {
			this.refs.dialog.getWrappedInstance().open();
		}

		this.props.recordGoogleEvent( 'Jetpack', 'Clicked To Open Disconnect Jetpack Dialog' );
	};

	render() {
		if ( this.props.hideOnAutomatedTransfer ) {
			return null;
		}

		const { site, redirect, linkDisplay } = this.props;

		const omitProps = [ 'hideOnAutomatedTransfer', 'site', 'redirect', 'isMock', 'linkDisplay', 'text', 'recordGoogleEvent' ];
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
	hideOnAutomatedTransfer: PropTypes.bool,
	site: PropTypes.object.isRequired,
	redirect: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	linkDisplay: PropTypes.bool,
	isMock: PropTypes.bool,
	text: PropTypes.string
};

DisconnectJetpackButton.defaultProps = {
	hideOnAutomatedTransfer: false,
	linkDisplay: true
};

export default connect(
	( state, { site } ) => ( {
		hideOnAutomatedTransfer: isSiteAutomatedTransfer( state, site.ID ),
	} ),
	{ recordGoogleEvent }
)( DisconnectJetpackButton );
