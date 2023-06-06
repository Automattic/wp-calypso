/* eslint-disable no-unused-vars */

// This is a temporary file that introduces strings that need to be translated.
// It will be removed once the page is complete and the strings are translated.

import { translate } from 'i18n-calypso';

// username is needed for some of the strings below
const username = 'username_placeholder';

const importSubscribers = translate( 'Import subscribers' );
const allSubscribers = translate( 'All subscribers' );

const subscribers = translate( 'Subscribers' );
const downloadCSV = translate( 'Download CSV' );
const addSubscribers = translate( 'Add Subscribers' );

const search = translate( 'Search by name, username or email…' );
const bulkActions = translate( 'Bulk actions' );

const name = translate( 'Name' );
const status = translate( 'Status' );
const active = translate( 'Active' );
const inactive = translate( 'Inactive' );
const openRate = translate( 'Open rate' );
const subscriptionType = translate( 'Subscription type' );
const free = translate( 'Free' );
const monthly = translate( 'Monthly' );
const yearly = translate( 'Yearly' );
const all = translate( 'All' );
const subscriptionDate = translate( 'Subscription date' );
const since = translate( 'Since' );
const view = translate( 'View' );
const passwordReset = translate( 'Send password reset' );
const remove = translate( 'Remove' );
const manage = translate( 'Manage' );

const previous = translate( 'Previous' );
const next = translate( 'Next' );

// "Grow your subscribers" section and page
const growYourSubscribers = translate( 'Grow your subscribers' );

const turnVisitorsTitle = translate( 'Turn your visitors into subscribers' );
const turnVisitorsBody = translate( 'Use a /subscriber block to easily grow your subscribers.' );

const importExistingTitle = translate( 'Import existing subscribers' );
const importExistingBody = translate(
	'Import your contacts by importing them via Gmail or a CSV file.'
);

const growYourAudienceTitle = translate( 'Grow your audience' );
const growYourAudienceBody = translate(
	'Do you want to get more traffic and views to your blog? If so, you’re in the right place.'
);

const learnMore = translate( 'Learn more' );

// "Grow your subscribers" page (some of the strings are already covered above)
const details = translate( 'Details' );
const publishingSharing = translate(
	'Publishing & sharing content can help bring traffic to your site. Let’s help you get started.'
);

// Subscription details page
const emailsReceived = translate( 'Emails received' );
const clickRate = translate( 'Click rate' );
const subscriptionDetails = translate( 'Subscription details' );
const tier = translate( 'Tier' );
const subscriberInformation = translate( 'Subscriber information' );
const source = translate( 'Source' );
const unsubscribe = translate( 'Unsubscribe' );
const unubscribeUsername = translate( 'Unsubscribe %s', {
	args: [ username ],
	comment: "%s is the subscriber's username",
} );

// Confirmation dialogs
const removeFreeSubscriberConfirmation = translate(
	'Are you sure you want to remove %s from your subscribers? They will no longer receive emails from you.',
	{ args: [ username ], comment: "%s is the subscriber's username" }
);
const removePaidSubscriberConfirmation = translate(
	'Are you sure you want to remove %s from your subscribers? They will no longer receive emails from you. You will not be able to add them back as a paid subscriber.',
	{ args: [ username ], comment: "%s is the subscriber's username" }
);
