/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { pick } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack-dialog';
import { recordGoogleEvent } from 'state/analytics/actions';
import { disconnect } from 'state/jetpack/connection/actions';
import { disconnectedSite as disconnectedSiteDeprecated } from 'lib/sites-list/actions';
import { setAllSitesSelected } from 'state/ui/actions';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanClass } from 'lib/plans/constants';
import { successNotice, errorNotice, infoNotice, removeNotice } from 'state/notices/actions';

class DisconnectJetpackButton extends Component {
	constructor( props ) {
		super( props );
		this.state = { dialogVisible: false };
	}

	handleClick = ( event ) => {
		event.preventDefault();
		const {
			isMock,
			recordGoogleEvent: recordGAEvent
		} = this.props;

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
	}

	disconnectJetpack = () => {
		const {
			site,
			translate,
			successNotice: showSuccessNotice,
			errorNotice: showErrorNotice,
			infoNotice: showInfoNotice,
			removeNotice: removeInfoNotice,
			disconnect: disconnectSite,
			recordGoogleEvent: recordGAEvent
		} = this.props;

		this.setState( { dialogVisible: false } );
		recordGAEvent( 'Jetpack', 'Clicked To Confirm Disconnect Jetpack Dialog' );

		const { notice } = showInfoNotice(
			translate( 'Disconnecting %(siteName)s.', { args: { siteName: site.title } } )
			, { isPersistent: true, showDismiss: false }
		);

		disconnectSite( site.ID ).then( () => {
			// Removing the domain from a domain-only site results
			// in the site being deleted entirely. We need to call
			// `receiveDeletedSiteDeprecated` here because the site
			// exists in `sites-list` as well as the global store.
			disconnectedSiteDeprecated( site );
			this.props.setAllSitesSelected();
			removeInfoNotice( notice.noticeId );
			showSuccessNotice( translate( 'Successfully disconnected %(siteName)s.', { args: { siteName: site.title } } ) );
			recordGAEvent( 'Jetpack', 'Successfully Disconnected' );
		}, () => {
			removeInfoNotice( notice.noticeId );
			showErrorNotice( translate( '%(siteName)s failed to disconnect', { args: { siteName: site.title } } ) );
			recordGAEvent( 'Jetpack', 'Failed Disconnected Site' );
		}, );

		page.redirect( this.props.redirect );
	}

	render() {
		const { site, linkDisplay, planClass } = this.props;

		const pickProps = [ 'compact', 'primary', 'scary', 'busy', 'type', 'href', 'borderless', 'target', 'rel' ];

		const buttonProps = {
			...pick( this.props, pickProps, ),
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
			text = this.props.translate( 'Disconnect', {
				context: 'Jetpack: Action user takes to disconnect Jetpack site from .com'
			} );
		}

		return <Button { ...buttonProps }>
			{ text }
			<DisconnectJetpackDialog
				isVisible={ this.state.dialogVisible }
				onDisconnect={ this.disconnectJetpack }
				onClose={ this.hideDialog }
				plan= { planClass }
				isBroken={ false }
				siteName={ site.slug }
				/>
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

export default connect(
	( state, ownProps ) => {
		const plan = getCurrentPlan( state, ownProps.site.ID );
		const planClass = plan && plan.productSlug
			? getPlanClass( plan.productSlug )
			: 'free';

		return {
			planClass
		};
	},
	{
		setAllSitesSelected,
		recordGoogleEvent,
		disconnect,
		successNotice,
		errorNotice,
		infoNotice,
		removeNotice
	}
)( localize( DisconnectJetpackButton ) );
