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
import { isRefundable } from 'lib/purchases';
import Main from 'components/main';
import paths from '../paths';
import Notice from 'components/notice';
import titles from 'me/purchases/titles';
import { goToManagePurchase, isDataLoading, recordPageView } from '../utils';

const CancelPrivateRegistration = React.createClass( {
	getInitialState() {
		return {
			disabled: false,
			cancelling: false
		};
	},

	componentWillMount() {
		recordPageView( 'cancel_private_registration', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		recordPageView( 'cancel_private_registration', this.props, nextProps );
	},

	cancel( event ) {
		// We call blur on the cancel button to remove the blue outline that shows up when you click on the button
		event.target.blur();

		const { id } = this.props.selectedPurchase.data;

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
				page( paths.managePurchaseDestination( this.props.selectedSite.slug, id, 'canceled-private-registration' ) );
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

		if ( ! isDataLoading( this.props ) ) {
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
						{ descriptionText }
					</div>
					<div className="cancel-private-registration__text">
						{ warningText }
					</div>

					{ button }
				</Card>
			</Main>
		);
	}
} );

export default CancelPrivateRegistration;
