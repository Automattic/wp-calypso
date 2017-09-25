/**
 * External dependencies
 */
import i18n, { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';
import { PLAN_BUSINESS, PLAN_PERSONAL, PLAN_PREMIUM } from 'lib/plans/constants';

// In the translated dates 7am UTC is 12am/midnight PT
const closedStartDate = i18n.moment( 'Mon, 11 Sep 2017 07:00:00 +0000' );
const closedEndDate = i18n.moment( 'Mon, 18 Sep 2017 07:00:00 +0000' );
const limitedHoursStartDate = i18n.moment( 'Wed, 13 Sep 2017 07:00:00 +0000' );
const limitedHoursEndDate = i18n.moment( 'Fri, 15 Sep 2017 07:00:00 +0000' );
const supportResumeDate = i18n.moment( 'Tue, 19 Sep 2017 07:00:00 +0000' );

const NonPlanPaidMessage = localize( ( { translate } ) => {
	return (
		<div>
			<p>
				{ Date.now() < closedStartDate
					? translate(
						'Private support will be closed from %(closed_start_date)s through %(closed_end_date)s, included. ' +
						'We will reopen private support on %(support_resume_date)s.', {
							args: {
								closed_start_date: closedStartDate.format( 'dddd, MMMM D' ),
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
								support_resume_date: supportResumeDate.format( 'dddd, MMMM D' ),
							}
						}
					)
					: translate(
						'Private support will be closed through %(closed_end_date)s, included. ' +
						'We will reopen private support on %(support_resume_date)s.', {
							args: {
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
								support_resume_date: supportResumeDate.format( 'dddd, MMMM D' ),
							}
						}
					)
				}
			</p>
			<p>
				{ translate(
					'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together ' +
					'to work on improving our services, building new features, and learning how to better serve you, our users. ' +
					'But never fear! If you need help in the meantime:'
				) }
			</p>
			<p>
				<a href="https://en.support.wordpress.com" target="_blank" rel="noopener noreferrer">
					https://en.support.wordpress.com
				</a>
			</p>
			<p>
				{ translate(
					'Our staff will be keeping an eye on the {{link}}Forums{{/link}} for urgent matters.', {
						components: {
							link: <a href="https://en.forums.wordpress.com/forum/support" target="_blank" rel="noopener noreferrer" />
						}
					}
				) }
			</p>
		</div>
	);
} );

const PersonalAndPremiumPlanMessage = localize( ( { translate } ) => {
	return (
		<div>
			<p>
				{ Date.now() < closedStartDate
					? translate(
						'Live chat support will be closed from %(closed_start_date)s through %(closed_end_date)s, included. ' +
						'Email support will be open during that time, and we will reopen live chat on %(support_resume_date)s.', {
							args: {
								closed_start_date: closedStartDate.format( 'dddd, MMMM D' ),
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
								support_resume_date: supportResumeDate.format( 'dddd, MMMM D' ),
							}
						}
					)
					: translate(
						'Private support will be closed through %(closed_end_date)s, included. ' +
						'We will reopen private support on %(support_resume_date)s.', {
							args: {
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
								support_resume_date: supportResumeDate.format( 'dddd, MMMM D' ),
							}
						}
					)
				}
			</p>
			<p>
				{ translate(
					'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together ' +
					'to work on improving our services, building new features, and learning how to better serve you, our users. ' +
					'But never fear! If you need help in the meantime, you can submit an email ticket through the contact form.'
				) }
			</p>
		</div>
	);
} );

const BusinessPlanMessage = localize( ( { translate } ) => {
	return (
		<div>
			<p>
				{ Date.now() < closedStartDate
					? translate(
						'Live chat support will be closed from %(closed_start_date)s through %(closed_end_date)s, with the ' +
						'exception of limited hours %(limited_hours_start_date)s–%(limited_hours_end_date)s. ' +
						'Email support will be open during that time, and we will reopen live chat on %(support_resume_date)s.', {
							args: {
								closed_start_date: closedStartDate.format( 'dddd, MMMM D' ),
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
								limited_hours_start_date: limitedHoursStartDate.format( 'MMMM D' ),
								limited_hours_end_date: limitedHoursEndDate.format( 'D' ),
								support_resume_date: supportResumeDate.format( 'dddd, MMMM D' ),
							}
						}
					)
					: translate(
						'Private support will be closed through %(closed_end_date)s, included. ' +
						'We will reopen private support on %(support_resume_date)s.', {
							args: {
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
								support_resume_date: supportResumeDate.format( 'dddd, MMMM D' ),
							}
						}
					)
				}
			</p>
			<p>
				{ translate(
					'Live chat will be available on September 13, 14, and 15 between the hours of 10:00am-1:00pm PDT ' +
					'and 2:30pm-5:00pm PDT.'
				) }
			</p>
			<p>
				{ translate(
					'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together ' +
					'to work on improving our services, building new features, and learning how to better serve you, our users. ' +
					'But never fear! If you need help in the meantime, you can submit an email ticket through the contact form.'
				) }
			</p>
		</div>
	);
} );

const HelpContactClosed = ( { translate, sitePlanSlug } ) => {
	let message;

	// Show different messages based on the plan of the site requesting help
	switch ( sitePlanSlug ) {
		case PLAN_PERSONAL:
		case PLAN_PREMIUM:
			message = <PersonalAndPremiumPlanMessage />;
			break;
		case PLAN_BUSINESS:
			message = <BusinessPlanMessage />;
			break;
		default:
			message = <NonPlanPaidMessage />;
			break;
	}

	return (
		<div className="help-contact-closed">
			<FormSectionHeading>
				{ translate( 'Limited Support %(closed_start_date)s - %(closed_end_date)s', {
					args: {
						closed_start_date: closedStartDate.format( 'MMM D' ),
						closed_end_date: closedEndDate.format( 'D' ),
					}
				} ) }
			</FormSectionHeading>
			{ message }
			<hr />
		</div>
	);
};

export default localize( HelpContactClosed );
