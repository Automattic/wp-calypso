import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import moment from 'moment';

export const getTransferRestrictionMessage = ( inboundTransferStatus ) => {
	const {
		domain,
		termMaximumInYears,
		transferEligibleDate,
		transferRestrictionStatus,
	} = inboundTransferStatus;

	let reason = null;

	const transferEligibleMoment = moment( transferEligibleDate );

	if ( 'max_term' === transferRestrictionStatus ) {
		reason = sprintf(
			/* translators: %(transferEligibleDate)s: a date formatted according to the user's locale (e.g: September 28, 2021), %(termMaximumInYears)d: number of years */
			__(
				'Transferring this domain would extend the registration period beyond the maximum allowed term ' +
					'of %(termMaximumInYears)d years. It can be transferred starting %(transferEligibleDate)s.'
			),
			{
				termMaximumInYears,
				transferEligibleDate: transferEligibleMoment.format( 'LL' ),
			}
		);
	} else if ( 'initial_registration_period' === transferRestrictionStatus ) {
		reason = createInterpolateElement(
			sprintf(
				/* translators:  %(daysUntilTransferEligible)d: number of days, %(transferEligibleDate)s: a date formatted according to the user's locale (e.g: September 28, 2021) */
				__(
					'Newly registered domains cannot be transferred. This domain can be transferred in <strong>%(daysUntilTransferEligible)d days</strong>, ' +
						"starting %(transferEligibleDate)s. You don't have to wait though, you can connect your domain to your site instead."
				),
				{
					domain,
					daysUntilTransferEligible: transferEligibleMoment.diff( moment(), 'days' ),
					transferEligibleDate: transferEligibleMoment.format( 'LL' ),
				}
			),
			{
				strong: <strong />,
			}
		);
	}

	return reason;
};
