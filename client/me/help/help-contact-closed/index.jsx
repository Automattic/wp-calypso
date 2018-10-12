/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';
import { isBusinessPlan, isPremiumPlan, isPersonalPlan } from 'lib/plans';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUserPurchases } from 'state/purchases/selectors';

const gm2018ClosureStartsAt = i18n.moment( 'Sat, 29 Sep 2018 00:00:00 +0000' );

const BusinessPlanMessage = ( { compact, translate } ) => {
	const message = [];

	if ( i18n.moment() < gm2018ClosureStartsAt ) {
		message.push(
			translate(
				'{{p}}Live chat will be available on October 1, 2, and 3 during the following hours:{{/p}}' +
					'{{ul}}' +
					'{{li}} October 1 - 2:30PM-6:30PM EDT {{/li}}' +
					'{{li}} October 2 - 10:00AM-12:30PM EDT and 2:30PM-5:00PM EDT {{/li}}' +
					'{{li}} October 3 - 1:30PM-6:30PM EDT {{/li}}' +
					'{{/ul}}' +
					'{{p}}Email support will be open during that time, and we will reopen live chat on Monday, October 8th.{{/p}}',
				{
					components: {
						p: <p />,
						ul: <ul />,
						li: <li />,
					},
				}
			)
		);
	} else {
		message.push(
			translate(
				'{{p}}Live chat support will be closed through Sunday, October 7th, ' +
					'with the exception of the following hours:{{/p}}' +
					'{{ul}}' +
					'{{li}} October 1 - 2:30PM-6:30PM EDT {{/li}}' +
					'{{li}} October 2 - 10:00AM-12:30PM EDT and 2:30PM-5:00PM EDT {{/li}}' +
					'{{li}} October 3 - 1:30PM-6:30PM EDT {{/li}}' +
					'{{/ul}}' +
					'{{p}}Email support will be open during that time, and we will reopen live chat on Monday, October 8th.{{/p}}',
				{
					components: {
						p: <p />,
						ul: <ul />,
						li: <li />,
					},
				}
			)
		);
	}

	if ( ! compact ) {
		message.push(
			translate(
				'{{p}}Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family ' +
					'get together to work on improving our services, building new features, and learning how to better serve you, ' +
					'our users. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form.{{/p}}',
				{ components: { p: <p /> } }
			)
		);
	}

	return message;
};

const PremiumAndPersonalPlanMessage = ( { compact, translate } ) => {
	const message = [];

	if ( i18n.moment() < gm2018ClosureStartsAt ) {
		message.push(
			translate(
				'{{p}}Live chat support will be closed from Saturday, September 29th through Sunday, October 7th, included. Email support will be open during that time, and we will reopen live chat on Monday, October 8th.{{/p}}',
				{ components: { p: <p /> } }
			)
		);
	} else {
		message.push(
			translate(
				'{{p}}Live chat support will be closed through Sunday, October 7th, included. We will reopen private support on Sunday, October 7th.{{/p}}',
				{ components: { p: <p /> } }
			)
		);
	}

	if ( ! compact ) {
		message.push(
			translate(
				'{{p}}Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family ' +
					'get together to work on improving our services, building new features, and learning how to better serve you, ' +
					'our users. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form.{{/p}}',
				{ components: { p: <p /> } }
			)
		);
	}

	return message;
};

const GeneralMessage = ( { compact, translate } ) => {
	const message = [];

	if ( i18n.moment() < gm2018ClosureStartsAt ) {
		message.push(
			translate(
				'{{p}}Private support will be closed Saturday, September 29th through Saturday, October 6th, included. We will reopen private support on Sunday, October 7th.{{/p}}',
				{ components: { p: <p /> } }
			)
		);
	} else {
		message.push(
			translate(
				'{{p}}Private support will be closed through Saturday, October 6th, included. We will reopen private support on Sunday, October 7th.{{/p}}',
				{ components: { p: <p /> } }
			)
		);
	}

	if ( ! compact ) {
		message.push(
			translate(
				'{{p}}Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family ' +
					'get together to work on improving our services, building new features, and learning how to better serve you, ' +
					'our users. But never fear! If you need help in the meantime:{{/p}}' +
					'{{p}}{{supportLink}}https://en.support.wordpress.com{{/supportLink}}{{/p}}' +
					'{{p}}Our staff will be keeping an eye on the {{forumLink}}Forums{{/forumLink}} for urgent matters.{{/p}}',
				{
					components: {
						p: <p />,
						supportLink: <a href="https://en.support.wordpress.com" />,
						forumLink: <a href="https://en.forums.wordpress.com/forum/support/" />,
					},
				}
			)
		);
	}

	return message;
};

const HelpContactClosed = ( { compact, translate, purchases } ) => {
	const hasBusinessPlan = some( purchases, ( { productSlug } ) => isBusinessPlan( productSlug ) );
	const hasPremiumOrPersonalPlan = some(
		purchases,
		( { productSlug } ) => isPremiumPlan( productSlug ) || isPersonalPlan( productSlug )
	);

	let closureHeading;
	let closureMessage;

	if ( hasBusinessPlan ) {
		closureHeading = translate( 'Limited Support September 29 - October 7' );
		closureMessage = <BusinessPlanMessage compact={ compact } translate={ translate } />;
	} else if ( hasPremiumOrPersonalPlan ) {
		closureHeading = translate( 'Limited Support September 29 - October 7' );
		closureMessage = <PremiumAndPersonalPlanMessage compact={ compact } translate={ translate } />;
	} else {
		closureHeading = translate( 'Limited Support September 29 - October 6' );
		closureMessage = <GeneralMessage compact={ compact } translate={ translate } />;
	}

	if ( compact ) {
		return (
			<FoldableCard
				className="help-contact-closed"
				clickableHeader={ true }
				compact={ true }
				header={ closureHeading }
			>
				{ closureMessage }
				{ translate( '{{contactLink}}Read more.{{/contactLink}}', {
					components: { contactLink: <a href="/help/contact" /> },
				} ) }
			</FoldableCard>
		);
	}

	return (
		<div className="help-contact-closed">
			<FormSectionHeading>{ closureHeading }</FormSectionHeading>
			<div>{ closureMessage }</div>
			<hr />
		</div>
	);
};

export default connect( state => {
	const userId = getCurrentUserId( state );
	return { purchases: getUserPurchases( state, userId ) };
} )( localize( HelpContactClosed ) );
