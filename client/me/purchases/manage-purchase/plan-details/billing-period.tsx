import { isMonthly, getYearlyPlanByMonthly } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_SUPPORT } from '@automattic/urls';
import { fixMe, localize, type LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isExpiring,
	isRenewingBeforeExpiration,
	showCreditCardExpiringWarning,
	isExpiredOrRemoved,
} from '../../lib/raw-purchase-helpers';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';

interface MomentProps {
	moment: typeof moment;
}

export interface PlanBillingPeriodProps {
	purchase: Purchase;
	site: SiteDetails | null | undefined;
	isProductOwner: boolean;
}

export class PlanBillingPeriod extends Component<
	PlanBillingPeriodProps &
		LocalizeProps &
		MomentProps & {
			recordTracksEvent: (
				event: string,
				options: { current_plan: string; upgrading_to: string }
			) => void;
		}
> {
	handleMonthlyToYearlyButtonClick = () => {
		const { purchase } = this.props;
		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.product_slug );

		this.props.recordTracksEvent( 'calypso_purchase_details_plan_upgrade_click', {
			current_plan: purchase.product_slug,
			upgrading_to: yearlyPlanSlug,
		} );
		page(
			( isJetpackCloud() ? 'https://wordpress.com' : '' ) +
				'/checkout/' +
				purchase.domain +
				'/' +
				yearlyPlanSlug +
				'?upgrade_from=' +
				purchase.product_slug
		);
	};

	renderYearlyBillingInformation() {
		const { purchase, translate, moment } = this.props;

		if ( showCreditCardExpiringWarning( purchase ) ) {
			return translate( 'Billed yearly, credit card expiring soon' );
		}

		if ( isRenewingBeforeExpiration( purchase ) && purchase.renew_date ) {
			const renewDate = moment( purchase.renew_date );
			return translate( 'Billed yearly, renews on %s', {
				args: renewDate.format( 'LL' ),
				comment: '%s is the renewal date in format M DD, Y, for example: June 10, 2019',
			} );
		}

		if ( isExpiring( purchase ) && purchase.expiry_date ) {
			return translate( 'Billed yearly, expires on %s', {
				args: moment( purchase.expiry_date ).format( 'LL' ),
				comment: '%s is the expiration date in format M DD, Y, for example: June 10, 2019',
			} );
		}

		if ( isExpiredOrRemoved( purchase ) && purchase.expiry_date ) {
			return translate( 'Billed yearly, expired %(timeSinceExpiry)s', {
				args: {
					timeSinceExpiry: moment( purchase.expiry_date ).fromNow(),
				},
				comment: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			} );
		}

		return translate( 'Billed yearly' );
	}

	renderBillingPeriod() {
		const { purchase, site, translate, moment, isProductOwner } = this.props;
		if ( ! purchase ) {
			return;
		}

		if ( ! isMonthly( purchase.product_slug ) ) {
			return (
				<FormSettingExplanation>{ this.renderYearlyBillingInformation() }</FormSettingExplanation>
			);
		}

		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.product_slug );
		if ( ! yearlyPlanSlug ) {
			return;
		}

		const isTemporarySite = purchase.is_attached_to_holding_site;
		const isExpired = isExpiredOrRemoved( purchase );

		const billedMonthlyText =
			isExpired && purchase.expiry_date
				? fixMe( {
						text: 'Billed monthly, expired %(timeSinceExpiry)s',
						newCopy: translate( 'Billed monthly, expired %(timeSinceExpiry)s', {
							args: {
								timeSinceExpiry: moment( purchase.expiry_date ).fromNow(),
							},
							comment:
								'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
						} ),
						oldCopy: translate( 'Billed monthly' ),
				  } )
				: translate( 'Billed monthly' );

		return (
			<Fragment>
				<FormSettingExplanation>
					{ billedMonthlyText }
					{ site && isProductOwner && ! purchase.is_locked && (
						<Button onClick={ this.handleMonthlyToYearlyButtonClick } primary compact>
							{ translate( 'Upgrade to yearly billing' ) }
						</Button>
					) }
				</FormSettingExplanation>
				{ ! site && ! isTemporarySite && ! purchase.is_locked && (
					<FormSettingExplanation>
						{ translate(
							'To manage your plan, please {{supportPageLink}}reconnect{{/supportPageLink}} your site.',
							{
								components: {
									supportPageLink: (
										<a
											href={
												localizeUrl( JETPACK_SUPPORT ) +
												'reconnecting-reinstalling-jetpack/#reconnecting-jetpack'
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
