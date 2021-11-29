import { getPlanClass } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PlanThankYouCard from 'calypso/blocks/plan-thank-you-card';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import wpcom from 'calypso/lib/wp';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteWooCommerceWizardUrl } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const VERIFY_EMAIL_ERROR_NOTICE = 'ecommerce-verify-email-error';
const RESEND_ERROR = 'RESEND_ERROR';
const RESEND_NOT_SENT = 'RESEND_NOT_SENT';
const RESEND_PENDING = 'RESEND_PENDING';
const RESEND_SUCCESS = 'RESEND_SUCCESS';

class AtomicStoreThankYouCard extends Component {
	state = { resendStatus: RESEND_NOT_SENT };

	componentDidUpdate( prevProps ) {
		/**
		 * This clears the  error in the event the email is verified in another tab
		 * or another browser and the isEmailVerified props is updated via polling.
		 */
		if ( this.props.isEmailVerified && ! prevProps.isEmailVerified ) {
			this.props.removeNotice( VERIFY_EMAIL_ERROR_NOTICE );
		}
	}

	checkVerification = () => this.props.fetchCurrentUser();

	resendEmail = () => {
		const { translate } = this.props;
		const { resendStatus } = this.state;

		this.props.removeNotice( VERIFY_EMAIL_ERROR_NOTICE );

		if ( RESEND_PENDING === resendStatus ) {
			return;
		}

		this.setState( { resendStatus: RESEND_PENDING } );

		wpcom.req.post( '/me/send-verification-email', ( error ) => {
			if ( error ) {
				this.props.errorNotice(
					translate( "Couldn't resend verification email. Please try again." ),
					{
						id: VERIFY_EMAIL_ERROR_NOTICE,
					}
				);

				this.setState( { resendStatus: RESEND_ERROR } );
				return;
			}

			this.setState( { resendStatus: RESEND_SUCCESS } );
		} );
	};

	resendButtonText = () => {
		const { translate } = this.props;
		const { resendStatus } = this.state;

		switch ( resendStatus ) {
			case RESEND_PENDING:
				return translate( 'Sending…' );
			case RESEND_SUCCESS:
				return translate( 'Email sent' );
			case RESEND_NOT_SENT:
			case RESEND_ERROR:
			default:
				return translate( 'Resend email' );
		}
	};

	renderAction = () => {
		const { isEmailVerified, translate, siteWooCommerceWizardUrl } = this.props;
		const { resendStatus } = this.state;

		if ( ! isEmailVerified ) {
			return (
				<div className="checkout-thank-you__atomic-store-action-buttons">
					<Interval onTick={ this.checkVerification } period={ EVERY_FIVE_SECONDS } />
					<Button
						className={ classNames( 'button', 'thank-you-card__button' ) }
						onClick={ this.resendEmail }
						busy={ RESEND_PENDING === resendStatus }
					>
						{ this.resendButtonText() }
					</Button>
				</div>
			);
		}

		return (
			<div className="checkout-thank-you__atomic-store-action-buttons">
				<a
					className={ classNames( 'button', 'thank-you-card__button' ) }
					href={ siteWooCommerceWizardUrl }
				>
					{ translate( 'Create your store!' ) }
				</a>
			</div>
		);
	};

	renderDescription() {
		const { emailAddress, isEmailVerified, translate } = this.props;

		if ( ! isEmailVerified ) {
			return (
				<Fragment>
					<div>
						{ translate(
							'Now that we have taken care of your plan, we need to verify your email address to create your store.'
						) }
					</div>
					<div className="checkout-thank-you__atomic-store-email-instruction">
						{ translate( 'Please click the link in the email we sent to %(emailAddress)s.', {
							args: { emailAddress },
						} ) }
					</div>
				</Fragment>
			);
		}

		return translate(
			"Now that we've taken care of the plan, it's time to start setting up your store"
		);
	}

	render() {
		const { translate, siteId, planClass } = this.props;

		const classes = classNames( 'checkout-thank-you__atomic-store', planClass );

		return (
			<div className={ classes }>
				<PlanThankYouCard
					siteId={ siteId }
					action={ this.renderAction() }
					heading={ translate( 'Thank you for your purchase!' ) }
					description={ this.renderDescription() }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const plan = getCurrentPlan( state, siteId );
		const planClass = plan && plan.productSlug ? getPlanClass( plan.productSlug ) : '';
		const emailAddress = getCurrentUserEmail( state );
		const isEmailVerified = isCurrentUserEmailVerified( state );
		const siteWooCommerceWizardUrl = getSiteWooCommerceWizardUrl( state, siteId );

		return {
			siteId,
			site,
			emailAddress,
			isEmailVerified,
			planClass,
			siteWooCommerceWizardUrl,
		};
	},
	{ errorNotice, fetchCurrentUser, removeNotice }
)( localize( AtomicStoreThankYouCard ) );
