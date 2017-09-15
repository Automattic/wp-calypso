import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cancelPrivacyProtection } from 'state/purchases/actions';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import {
	getByPurchaseId,
	getPurchasesError,
	hasLoadedUserPurchasesFromServer,
} from 'state/purchases/selectors';
import { getPurchase, isDataLoading, goToManagePurchase, recordPageView } from '../utils';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import { hasPrivacyProtection, isRefundable } from 'lib/purchases';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import notices from 'notices';
import Notice from 'components/notice';
import paths from '../paths';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';
import { CALYPSO_CONTACT } from 'lib/url/support';

const user = userFactory();

const CancelPrivacyProtection = React.createClass( {
	propTypes: {
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	},

	getInitialState() {
		return {
			disabled: false,
			cancelling: false,
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
			page.redirect( paths.purchasesRoot() );
		}
	},

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const { selectedSite } = props, purchase = getPurchase( props );

		return selectedSite && purchase && hasPrivacyProtection( purchase );
	},

	cancel( event ) {
		// We call blur on the cancel button to remove the blue outline that shows up when you click on the button
		event.target.blur();

		const { id, meta: domain } = getPurchase( this.props );

		this.setState( {
			disabled: true,
			cancelling: true,
		} );

		this.props
			.cancelPrivacyProtection( id )
			.then( () => {
				this.resetState();

				notices.success(
					this.props.translate(
						'You have successfully canceled privacy protection for %(domain)s.',
						{
							args: { domain },
						}
					),
					{ persistent: true }
				);

				page( paths.managePurchase( this.props.selectedSite.slug, id ) );
			} )
			.catch( () => {
				this.resetState();
			} );
	},

	resetState() {
		this.setState( this.getInitialState() );
	},

	renderDescriptionText() {
		const purchase = getPurchase( this.props );

		return (
			<p>
				{ this.props.translate(
					'You are about to cancel the privacy protection upgrade for {{strong}}%(domain)s{{/strong}}. ' +
						'{{br/}}' +
						'This will make your personal details public.',
					{
						components: { strong: <strong />, br: <br /> },
						args: { domain: purchase.meta },
					}
				) }
			</p>
		);
	},

	renderWarningText() {
		const purchase = getPurchase( this.props );

		return (
			<strong>
				{ isRefundable( purchase )
					? this.props.translate( 'You will receive a refund when the upgrade is cancelled.' )
					: this.props.translate( 'You will not receive a refund when the upgrade is cancelled.' ) }
			</strong>
		);
	},

	renderButton() {
		return (
			<Button
				onClick={ this.cancel }
				className="cancel-privacy-protection__cancel-button"
				disabled={ this.state.disabled }
			>
				{ this.state.cancelling
					? this.props.translate( 'Processing…' )
					: this.props.translate( 'Cancel Privacy Protection' ) }
			</Button>
		);
	},

	renderNotice() {
		const { error, translate } = this.props;

		if ( error ) {
			return (
				<Notice status="is-error" showDismiss={ false }>
					{ error }
					{ ' ' }
					{ translate( 'Please try again later or {{a}}contact support.{{/a}}', {
						components: { a: <a href={ CALYPSO_CONTACT } /> },
					} ) }
				</Notice>
			);
		}

		return null;
	},

	render() {
		const classes = classNames( 'cancel-privacy-protection__card', {
			'is-placeholder': isDataLoading( this.props ),
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
				<QueryUserPurchases userId={ user.get().ID } />
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.cancelPrivacyProtection }
				</HeaderCake>
				{ notice }
				<Card className={ classes }>
					<div className="cancel-privacy-protection__text">
						<span>{ descriptionText }</span>
					</div>
					<div className="cancel-privacy-protection__text">
						<span>{ warningText }</span>
					</div>

					{ button }
				</Card>
			</Main>
		);
	},
} );

export default connect(
	( state, props ) => ( {
		error: getPurchasesError( state ),
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, props.purchaseId ),
		selectedSite: getSelectedSiteSelector( state ),
	} ),
	{ cancelPrivacyProtection }
)( localize( CancelPrivacyProtection ) );
