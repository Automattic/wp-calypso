import { isMonthly, getYearlyPlanByMonthly } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	isExpired,
	isExpiring,
	isRenewing,
	showCreditCardExpiringWarning,
} from 'calypso/lib/purchases';
import { JETPACK_SUPPORT } from 'calypso/lib/url/support';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackTemporarySitePurchase } from '../../utils';

export class PlanBillingPeriod extends Component {
	static propTypes = {
		purchase: PropTypes.object,
		site: PropTypes.object,
		isProductOwner: PropTypes.bool,
	};

	handleMonthlyToYearlyButtonClick = () => {
		const { purchase } = this.props;
		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.productSlug );

		this.props.recordTracksEvent( 'calypso_purchase_details_plan_upgrade_click', {
			current_plan: purchase.productSlug,
			upgrading_to: yearlyPlanSlug,
		} );
		page(
			( isJetpackCloud() ? 'https://wordpress.com' : '' ) +
				'/checkout/' +
				purchase.domain +
				'/' +
				yearlyPlanSlug
		);
	};

	renderYearlyBillingInformation() {
		const { purchase, translate, moment } = this.props;

		if ( showCreditCardExpiringWarning( purchase ) ) {
			return translate( 'Billed yearly, credit card expiring soon' );
		}

		if ( isRenewing( purchase ) && purchase.renewDate ) {
			const renewDate = moment( purchase.renewDate );
			return translate( 'Billed yearly, renews on %s', {
				args: renewDate.format( 'LL' ),
				comment: '%s is the renewal date in format M DD, Y, for example: June 10, 2019',
			} );
		}

		if ( isExpiring( purchase ) && purchase.expiryDate ) {
			return translate( 'Billed yearly, expires on %s', {
				args: moment( purchase.expiryDate ).format( 'LL' ),
				comment: '%s is the expiration date in format M DD, Y, for example: June 10, 2019',
			} );
		}

		if ( isExpired( purchase ) && purchase.expiryDate ) {
			return translate( 'Billed yearly, expired %(timeSinceExpiry)s', {
				args: {
					timeSinceExpiry: moment( purchase.expiryDate ).fromNow(),
				},
				comment: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			} );
		}

		return translate( 'Billed yearly' );
	}

	renderBillingPeriod() {
		const { purchase, site, translate, isProductOwner } = this.props;
		if ( ! purchase ) {
			return;
		}

		if ( ! isMonthly( purchase.productSlug ) ) {
			return (
				<FormSettingExplanation>{ this.renderYearlyBillingInformation() }</FormSettingExplanation>
			);
		}

		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.productSlug );
		if ( ! yearlyPlanSlug ) {
			return;
		}

		const isJetpackTemporarySite = isJetpackTemporarySitePurchase( purchase.domain );

		return (
			<Fragment>
				<FormSettingExplanation>
					{ translate( 'Billed monthly' ) }
					{ site && isProductOwner && ! purchase.isLocked && (
						<Button onClick={ this.handleMonthlyToYearlyButtonClick } primary compact>
							{ translate( 'Upgrade to yearly billing' ) }
						</Button>
					) }
				</FormSettingExplanation>
				{ ! site && ! isJetpackTemporarySite && ! purchase.isLocked && (
					<FormSettingExplanation>
						{ translate(
							'To manage your plan, please {{supportPageLink}}reconnect{{/supportPageLink}} your site.',
							{
								components: {
									supportPageLink: (
										<a
											href={
												JETPACK_SUPPORT + 'reconnecting-reinstalling-jetpack/#reconnecting-jetpack'
											}
										/>
									),
								},
							}
						) }
					</FormSettingExplanation>
				) }
			</Fragment>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="plan-billing-period">{ translate( 'Billing period' ) }</FormLabel>

				{ this.renderBillingPeriod() }
			</FormFieldset>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( withLocalizedMoment( PlanBillingPeriod ) ) );
