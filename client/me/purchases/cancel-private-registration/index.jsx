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
import Card from 'components/card';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import paths from '../paths';
import { isRefundable } from 'lib/purchases';
import { cancelPrivateRegistration } from 'lib/upgrades/actions';
import SimpleNotice from 'notices/simple-notice';
import { goToManagePurchase, isDataLoading, recordPageView } from '../utils';

const CancelPrivateRegistration = React.createClass( {
	getInitialState() {
		return {
			disabled: false
		};
	},

	componentWillMount() {
		recordPageView( 'cancel_private_registration', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		recordPageView( 'cancel_private_registration', this.props, nextProps );
	},

	cancel() {
		const { domain, id } = this.props.selectedPurchase.data;

		this.setState( {
			disabled: true
		} );

		cancelPrivateRegistration( id, canceledSuccessfully => {
			if ( canceledSuccessfully ) {
				page( paths.managePurchaseDestination( domain, id, 'canceled-private-registration' ) );
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
				{ this.translate( 'Cancel Private Registration' ) }
			</Button>
		);
	},

	renderNotice() {
		const purchase = this.props.selectedPurchase.data;

		if ( purchase.error ) {
			return <SimpleNotice status='is-error' showDismiss={ false }>{ purchase.error }</SimpleNotice>;
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

			<Main className="manage-purchase__detail">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ this.translate( 'Cancel Private Registration' ) }
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
