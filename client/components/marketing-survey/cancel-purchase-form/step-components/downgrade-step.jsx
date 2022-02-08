import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const noop = () => {};

export class DowngradeStep extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		refundAmount: PropTypes.string,
		planCost: PropTypes.string,
		translate: PropTypes.func.isRequired,
		cancelBundledDomain: PropTypes.bool,
		includedDomainPurchase: PropTypes.object,
	};

	static defaultProps = {
		translate: noop,
	};

	onClick = () => {
		this.props.recordTracksEvent( 'calypso_cancellation_downgrade_step_click' );
	};

	render() {
		const {
			locale,
			translate,
			refundAmount,
			planCost,
			currencySymbol,
			upsell,
			cancelBundledDomain,
			includedDomainPurchase,
		} = this.props;
		const canRefund = !! parseFloat( refundAmount );
		const amount = currencySymbol + ( canRefund ? refundAmount : planCost );
		const isEnglishLocale = [ 'en', 'en-gb' ].indexOf( locale ) >= 0;
		const downgradeWarning = translate(
			'If you choose to downgrade, your plan will be downgraded immediately.'
		);
		let refundDetails;
		let refundTitle;
		let refundReason;
		if ( isEnglishLocale ) {
			refundTitle = translate( 'Would you rather switch to a more affordable plan?' );
			refundReason = (
				<p>
					{ translate(
						'WordPress.com Personal still gives you access to customer support via email, removal of ads, and more — and for 50% of the cost of your current plan.'
					) }
				</p>
			);
			refundDetails = canRefund
				? translate(
						'You can downgrade and get a partial refund of %(amount)s or ' +
							'continue to the next step and cancel the plan.',
						{ args: { amount } }
				  )
				: translate( 'You can downgrade and the new plan will renew at only %(amount)s.', {
						args: { amount },
				  } );
		} else {
			refundTitle = translate( 'Would you rather switch to a lower-tier plan?' );
			refundDetails = canRefund
				? translate(
						'You can downgrade to Personal and get a partial refund of %(amount)s or ' +
							'continue to the next step and cancel the plan.',
						{ args: { amount } }
				  )
				: translate(
						'You can downgrade to Personal and the new plan will renew at only %(amount)s.',
						{ args: { amount } }
				  );
		}

		if ( 'downgrade-monthly' === upsell && canRefund ) {
			refundTitle = translate(
				'Would you rather switch to the more affordable monthly subscription?'
			);

			if ( cancelBundledDomain && includedDomainPurchase ) {
				refundReason = (
					<p>
						{ translate(
							'You will keep most features of your current plan including the domain %(domain)s but the plan period will be reduced.',
							{ args: { domain: includedDomainPurchase.meta } }
						) }
					</p>
				);
			} else {
				refundReason = (
					<p>
						{ translate(
							'You will keep most of the features of your current plan but will not have a free domain registration.'
						) }
					</p>
				);
			}

			refundDetails = translate(
				'You can downgrade and get a partial refund of %(amount)s or ' +
					'continue to the next step and cancel the plan.',
				{ args: { amount } }
			);
		}

		return (
			<div>
				<FormSectionHeading>{ refundTitle }</FormSectionHeading>
				<FormFieldset>
					{ refundReason }
					<p>
						{ refundDetails } { downgradeWarning }
					</p>
				</FormFieldset>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	selectedSite: getSelectedSite( state ),
} );
const mapDispatchToProps = { recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( DowngradeStep ) );
