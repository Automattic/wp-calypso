/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import { isEcommercePlan, isBusinessPlan, isPremiumPlan, isPersonalPlan } from 'lib/plans';
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-HEADING';
import { useLocalizedMoment } from 'components/localized-moment';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const DATE_FORMAT_SHORT = 'MMMM D';
const DATE_FORMAT_LONG = 'dddd, MMMM Do';

const GMClosureNotice = ( {
	businessAndEcommerceClosesAt,
	businessAndEcommerceReopensAt,
	compact,
	defaultClosesAt,
	defaultReopensAt,
	displayAt,
	purchases,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const hasBusinessOrEcommercePlan = purchases.some(
		( { productSlug } ) => isBusinessPlan( productSlug ) || isEcommercePlan( productSlug )
	);
	const hasPersonalOrPremiumPlan = purchases.some(
		( { productSlug } ) => isPersonalPlan( productSlug ) || isPremiumPlan( productSlug )
	);
	const hasNoPlan = ! hasBusinessOrEcommercePlan && ! hasPersonalOrPremiumPlan;

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	const [ closesAt, closedUntil, reopensAt ] = [
		moment.tz(
			hasBusinessOrEcommercePlan ? businessAndEcommerceClosesAt : defaultClosesAt,
			guessedTimezone
		),
		moment
			.tz(
				hasBusinessOrEcommercePlan ? businessAndEcommerceReopensAt : defaultReopensAt,
				guessedTimezone
			)
			.subtract( 1, 'days' ),
		moment.tz(
			hasBusinessOrEcommercePlan ? businessAndEcommerceReopensAt : defaultReopensAt,
			guessedTimezone
		),
	];

	if ( ! currentDate.isBetween( displayAt, reopensAt ) ) {
		return null;
	}

	const HEADING = translate( 'Limited Support %(closesAt)s – %(closedUntil)s', {
		args: {
			closesAt: closesAt.format( DATE_FORMAT_SHORT ),
			closedUntil: closedUntil.format(
				closedUntil.isSame( closesAt, 'month' ) ? 'D' : DATE_FORMAT_SHORT
			),
		},
	} );

	const mainMessageArgs = {
		closed_start_date: closesAt.format( DATE_FORMAT_LONG ),
		closed_end_date: closedUntil.format( DATE_FORMAT_LONG ),
		support_resume_date: reopensAt.format( DATE_FORMAT_LONG ),
	};

	const MAIN_MESSAGES = {
		before: {
			hasPlan: translate(
				'Live chat support will be closed from %(closed_start_date)s through %(closed_end_date)s, included. Email support will be open during that time, and we will reopen live chat on %(support_resume_date)s.',
				{ args: mainMessageArgs }
			),
			nonPlan: translate(
				'Private support will be closed from %(closed_start_date)s through %(closed_end_date)s, included. We will reopen private support on %(support_resume_date)s.',
				{ args: mainMessageArgs }
			),
		},
		during: {
			hasPlan: translate(
				'Live chat support will be closed through %(closed_end_date)s, included. Email support will be open during that time, and we will reopen live chat on %(support_resume_date)s.',
				{ args: mainMessageArgs }
			),
			nonPlan: translate(
				'Private support will be closed through %(closed_end_date)s, included. We will reopen private support on %(support_resume_date)s.',
				{ args: mainMessageArgs }
			),
		},
	};

	const REASON_MESSAGES = {
		hasPlan: translate(
			'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form: {{contactLink}}https://wordpress.com/help/contact{{/contactLink}}',
			{
				components: {
					contactLink: <a href="/help/contact" />,
				},
			}
		),
		nonPlan: translate(
			'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, check our support site at {{supportLink}}https://en.support.wordpress.com{{/supportLink}}',
			{
				components: {
					supportLink: <a href="https://en.support.wordpress.com" />,
				},
			}
		),
	};

	const FORUMS_NOTE = translate(
		'Our staff will be keeping an eye on the {{link}}Forums{{/link}} for urgent matters.',
		{
			components: {
				link: <a href="https://en.forums.wordpress.com/forum/support/" />,
			},
		}
	);

	const period = currentDate.isBefore( closesAt ) ? 'before' : 'during';
	const mainMessage = hasNoPlan ? MAIN_MESSAGES[ period ].nonPlan : MAIN_MESSAGES[ period ].hasPlan;
	const reason = hasNoPlan ? REASON_MESSAGES.nonPlan : REASON_MESSAGES.hasPlan;

	if ( compact ) {
		return (
			<FoldableCard
				className="gm-closure-notice"
				clickableHeader={ true }
				compact={ true }
				header={ HEADING }
			>
				{ mainMessage }
				<br />
				<br />
				{ translate( '{{contactLink}}Read more.{{/contactLink}}', {
					components: { contactLink: <a href="/help/contact" /> },
				} ) }
			</FoldableCard>
		);
	}

	return (
		<div className="gm-closure-notice">
			<FormSectionHeading>{ HEADING }</FormSectionHeading>
			<div>
				<p>{ mainMessage }</p>
				<p>{ reason }</p>
				{ hasNoPlan && <p>{ FORUMS_NOTE }</p> }
			</div>
			<hr />
		</div>
	);
};

export default connect( state => {
	const userId = getCurrentUserId( state );
	return { purchases: getUserPurchases( state, userId ) };
} )( GMClosureNotice );
