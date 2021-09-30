import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import moment from 'moment';

export const getTransferRestrictionMessage = ( inboundTransferStatus ) => {
	const {
		creationDate,
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
				/* translators: %(transferEligibleDate)s: a date formatted according to the user's locale (e.g: September 28, 2021), %(daysAgoRegistered)d: number of days */
				__(
					'Newly-registered domains are not eligible for transfer. <strong>%(domain)s</strong> was registered ' +
						'%(daysAgoRegistered)d days ago, and can be transferred starting %(transferEligibleDate)s.'
				),
				{
					domain,
					daysAgoRegistered: moment().diff( creationDate, 'days' ),
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
