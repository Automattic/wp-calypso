/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { isEcommercePlan, isBusinessPlan, isPremiumPlan, isPersonalPlan } from 'lib/plans';
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';
import { useLocalizedMoment } from 'components/localized-moment';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUserPurchases } from 'state/purchases/selectors';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

const DATE_FORMAT_SHORT = 'MMMM D';
const DATE_FORMAT_LONG = 'dddd, MMMM Do LT';

const GMClosureNotice = ( {
	priorityChatClosesAt,
	priorityChatReopensAt,
	compact,
	basicChatClosesAt,
	basicChatReopensAt,
	displayAt,
	purchases,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const hasBusinessOrEcommercePlan = some(
		purchases,
		( { productSlug } ) => isBusinessPlan( productSlug ) || isEcommercePlan( productSlug )
	);
	const hasPersonalOrPremiumPlan = some(
		purchases,
		( { productSlug } ) => isPersonalPlan( productSlug ) || isPremiumPlan( productSlug )
	);
	const hasNoPlan = ! hasBusinessOrEcommercePlan && ! hasPersonalOrPremiumPlan;

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	const [ closesAt, reopensAt ] = [
		moment.tz(
			hasBusinessOrEcommercePlan ? priorityChatClosesAt : basicChatClosesAt,
			guessedTimezone
		),
		moment.tz(
			hasBusinessOrEcommercePlan ? priorityChatReopensAt : basicChatReopensAt,
			guessedTimezone
		),
	];

	if ( ! currentDate.isBetween( displayAt, reopensAt ) ) {
		return null;
	}

	const HEADING = translate( 'Limited Support %(closesAt)s – %(reopensAt)s', {
		args: {
			closesAt: closesAt.format( DATE_FORMAT_SHORT ),
			reopensAt: reopensAt.format(
				reopensAt.isSame( closesAt, 'month' ) ? 'D' : DATE_FORMAT_SHORT
			),
		},
	} );

	const mainMessageArgs = {
		closes_at: closesAt.format( DATE_FORMAT_LONG ),
		reopens_at: reopensAt.format( DATE_FORMAT_LONG ),
	};

	const MAIN_MESSAGES = {
		before: {
			hasPlan: translate(
				'Live chat support will be closed from %(closes_at)s until %(reopens_at)s. Email support will remain open.',
				{ args: mainMessageArgs }
			),
			nonPlan: translate(
				'Private support will be closed from %(closes_at)s until %(reopens_at)s.',
				{ args: mainMessageArgs }
			),
		},
		during: {
			hasPlan: translate(
				'Live chat support is closed until %(reopens_at)s. In the meantime you can still reach us by email.',
				{ args: mainMessageArgs }
			),
			nonPlan: translate( 'Private support is closed until %(reopens_at)s.', {
				args: mainMessageArgs,
			} ),
		},
	};

	const REASON_MESSAGES = {
		hasPlan: translate(
			'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form: {{contactLink}}{{/contactLink}}',
			{
				components: {
					contactLink: <a href="/help/contact" />,
				},
				args: {
					linkUrl: 'https://wordpress.com/help/contact',
				},
			}
		),
		nonPlan: translate(
			'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, check our support site at {{supportLink}}%(linkUrl)s{{/supportLink}}',
			{
				components: {
					supportLink: <a href={ localizeUrl( 'https://wordpress.com/support/' ) } />,
				},
				args: {
					linkUrl: localizeUrl( 'https://wordpress.com/support/' ),
				},
			}
		),
	};

	const FORUMS_NOTE = translate(
		'Our staff will be keeping an eye on the {{link}}Forums{{/link}} for urgent matters.',
		{
			components: {
				link: <a href={ localizeUrl( 'https://en.forums.wordpress.com/forum/support/' ) } />,
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

export default connect( ( state ) => {
	const userId = getCurrentUserId( state );
	return { purchases: getUserPurchases( state, userId ) };
} )( GMClosureNotice );
