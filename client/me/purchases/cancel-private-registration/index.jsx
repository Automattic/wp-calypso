/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cancelPrivateRegistration } from 'lib/upgrades/actions';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import { getPurchase, isDataLoading, goToManagePurchase, recordPageView } from '../utils';
import { hasPrivateRegistration, isRefundable } from 'lib/purchases';
import Main from 'components/main';
import notices from 'notices';
import Notice from 'components/notice';
import paths from '../paths';
import titles from 'me/purchases/titles';

const CancelPrivateRegistration = React.createClass( {
	propTypes: {
		hasLoadedSites: React.PropTypes.bool.isRequired,
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] )
	},

	getInitialState() {
		return {
			disabled: false,
			cancelling: false
		};
	},

	componentWillMount() {
		this.redirectIfDataIsInvalid();

		recordPageView( 'cancel_private_registration', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );

		recordPageView( 'cancel_private_registration', this.props, nextProps );
	},

	redirectIfDataIsInvalid( props = this.props ) {
		if ( ! this.isDataValid( props ) ) {
			page.redirect( paths.list() );
		}
	},

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const { selectedSite } = props,
			purchase = getPurchase( props );

		return selectedSite && purchase && hasPrivateRegistration( purchase );
	},

	cancel( event ) {
		// We call blur on the cancel button to remove the blue outline that shows up when you click on the button
		event.target.blur();

		const { id, meta: domain } = this.props.selectedPurchase.data;

		this.setState( {
			disabled: true,
			cancelling: true
		} );

		cancelPrivateRegistration( id, success => {
			this.setState( {
				cancelling: false,
				disabled: false
			} );

			if ( success ) {
				notices.success( this.translate( 'You have successfully canceled private registration for %(domain)s.', {
					args: { domain }
				} ), { persistent: true } );

				page( paths.managePurchase( this.props.selectedSite.slug, id ) );
			}
		} );
	},

	renderDescriptionText() {
		const purchase = this.props.selectedPurchase.data;

		return (
			<p>
				{
					this.translate(
						'You are about to cancel the privacy upgrade for {{strong}}%(domain)s{{/strong}}. ' +
						'{{br/}}' +
						'This will make your personal details public.',
						{
							components: { strong: <strong />, br: <br /> },
							args: { domain: purchase.meta }
						}
					)
				}
			</p>
		);
	},

	renderWarningText() {
		const purchase = this.props.selectedPurchase.data;

		return (
			<strong>
				{
					isRefundable( purchase )
					? this.translate( 'You will receive a refund when the upgrade is cancelled.' )
					: this.translate( 'You will not receive a refund when the upgrade is cancelled.' )
				}
			</strong>
		);
	},

	renderButton() {
		return (
			<Button
				onClick={ this.cancel }
				className="cancel-private-registration__cancel-button"
				disabled={ this.state.disabled }>
				{
					this.state.cancelling
						? this.translate( 'Processing…' )
						: this.translate( 'Cancel Private Registration' ) }
			</Button>
		);
	},

	renderNotice() {
		const purchase = this.props.selectedPurchase.data;

		if ( purchase.error ) {
			return <Notice status='is-error' showDismiss={ false }>{ purchase.error }</Notice>;
		}

		return null;
	},

	render() {
		const classes = classNames( 'cancel-private-registration__card', {
			'is-placeholder': isDataLoading( this.props )
		} );

		let notice,
			button,
			descriptionText = (
				<p>
					<span />
					<span />
				</p>
			),
			warningText = (
				<p>
					<span />
				</p>
			);

		if ( ! isDataLoading( this.props ) && this.isDataValid() ) {
			notice = this.renderNotice();
			button = this.renderButton();
			descriptionText = this.renderDescriptionText();
			warningText = this.renderWarningText();
		}

		return (

			<Main>
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.cancelPrivateRegistration }
				</HeaderCake>
				{ notice }
				<Card className={ classes }>
					<div className="cancel-private-registration__text">
						<span>{ descriptionText }</span>
					</div>
					<div className="cancel-private-registration__text">
						<span>{ warningText }</span>
					</div>

					{ button }
				</Card>
			</Main>
		);
	}
} );

export default CancelPrivateRegistration;
