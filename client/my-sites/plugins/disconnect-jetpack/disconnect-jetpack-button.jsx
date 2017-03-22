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
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack-dialog';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanClass } from 'lib/plans/constants';

class DisconnectJetpackButton extends Component {
	constructor( props ) {
		super( props );
		this.state = { dialogVisible: false };
	}

	handleClick = ( event ) => {
		event.preventDefault();
		if ( this.props.isMock ) {
			return;
		}

		this.setState( { dialogVisible: true } );
		this.props.recordGoogleEvent( 'Jetpack', 'Clicked To Open Disconnect Jetpack Dialog' );
	};

	hideDialog = () => {
		this.setState( { dialogVisible: false } );
	}

	disconnectJetpack = () => {
		this.setState( { dialogVisible: false } );
	}

	render() {
		const { site, linkDisplay, planClass } = this.props;

		const omitProps = [ 'site', 'redirect', 'isMock', 'linkDisplay', 'text', 'recordGoogleEvent', 'planClass' ];
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
	{ recordGoogleEvent }
)( DisconnectJetpackButton );
