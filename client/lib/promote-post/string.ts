import { useTranslate } from 'i18n-calypso';

const BlazePressStrings = () => {
	const translate = useTranslate();
	translate( 'Calculating' );
	translate( 'Cannot calculate' );
	translate( 'Redirecting to my campaigns…' );
	translate( 'Oops!' );
	translate( 'The campaign cannot be created. Please {{a}}contact our support team{{/a}}.' );
	translate( 'Go to my campaigns' );
	translate( 'All set!' );
	translate(
		'The ad has been submitted for approval. We’ll send you a confirmation email once it’s approved and running.'
	);
	translate( 'Skip and go to my campaigns next time.' );
	translate(
		'Learn more about the {{linkAdvertisingPolicy}}Advertising Policy{{/linkAdvertisingPolicy}}.'
	);
	translate( 'Creating campaign…' );
	translate( 'Make the most of your Blaze campaign' );
	translate( 'Choose an eye-catching image for your ad' );
	translate( 'Adjust your title to make it more engaging' );
	translate( 'Pick the right audience, budget and duration' );
	translate( 'Get started' );
	translate( 'Learn more' );
	translate( "Don't show me this step again." );
	translate( 'Checking payment information…' );
	translate( 'Fetching pages…' );
	translate( 'Fetching posts…' );
	translate( 'Fetching more pages…' );
	translate( 'Fetching more posts…' );
	translate( 'No pages found.' );
	translate( 'No posts found.' );
	translate( 'Select post to promote' );
	translate( 'Post' );
	translate( 'Type' );
	translate( 'Publish date' );
	translate( 'Visitors' );
	translate( 'Likes' );
	translate( 'Comments' );
	translate( 'Advanced Settings' );
	translate( 'Targeted Devices' );
	translate( 'Destination URL' );
	translate( 'The page URL' );
	translate( 'The post URL' );
	translate( 'The blog page' );
	translate( 'The site home' );
	translate( 'Appearance' );
	translate( 'Ad creative' );
	translate( "Use post's media" );
	translate( 'Title' );
	translate( 'Page title' );
	translate( '%(charactersLeft)s character remaining', '%(charactersLeft)s characters remaining', {
		count: 1,
	} );
	translate( 'Snippet' );
	translate( 'Article Snippet' );
	translate(
		'%(snippetCharactersLeft)s character remaining',
		'%(snippetCharactersLeft)s characters remaining',
		{ count: 1 }
	);
	translate( 'Use + / - or simply drag the image to adjust it' );
	translate( 'Apply' );
	translate( 'Reset' );
	translate( 'Upload' );
	translate( 'Crop' );
	translate( 'Drop an image here to upload.' );
	translate( 'Click or drag an image here to upload.' );
	translate( 'Audience' );
	translate( 'Future reach is unavailable' );
	translate( 'All languages' );
	translate(
		'Based on the language of your site we suggest targeting %(lang)s speaking users to ensure the ad is seen by the right audience and to increase its effectiveness.'
	);
	translate( 'Language' );
	translate( 'Everywhere' );
	translate( 'Location' );
	translate( 'All Locations' );
	translate( 'All topics' );
	translate( 'Interests' );
	translate( 'Pick a few categories, like food or pets, to narrow your audience.' );
	translate( 'Budget and duration' );
	translate( 'Total' );
	translate(
		'Daily spend for %(durationDays)s-day duration',
		'Daily spend for %(durationDays)s-day duration',
		{ count: 1 }
	);
	translate( 'Estimated people reached per day' );
	translate( 'Start date' );
	translate( 'Duration (days)' );
	translate( 'days' );
	translate( 'Credits will be automatically applied to your order when available.' );
	translate( 'Credits: %(creditsUsed)s (%(remainingCredit)s remain)' );
	translate( 'Review your campaign' );
	translate(
		'We created this campaign to deliver the most valuable traffic, yet you can still make changes before submitting it.'
	);
	translate( 'Duration' );
	translate( 'Budget' );
	translate( 'day' );
	translate( 'Estimated impressions' );
	translate( 'Payment' );
	translate( 'You won’t be charged until the ad is approved and starts running.' );
	translate( 'You can pause spending at any time.' );
	translate(
		'Cannot create subscription. Please {{supportLink}}contact support{{/supportLink}} or try again later.'
	);
	translate( 'Could not retrieve countries. Please try again later.' );
	translate( 'Error submitting payment. Please check payment information.' );
	translate(
		'There was an error with the address. Please verify that all the required data is valid'
	);
	translate(
		'There was an error with the address. The province, state or region should be filled'
	);
	translate(
		'There was an error with the address. Please, check that the Zip code exists, is valid for the country, and corresponds for the given address'
	);
	translate( 'Use saved card' );
	translate( 'First Name' );
	translate( 'Last Name' );
	translate( 'Country' );
	translate( 'Zip / Postal code' );
	translate( 'Save this card for future payments' );
	translate( 'Saved cards' );
	translate( 'Add new card' );
	translate( '(ending %(lastFour)s)' );
	translate( 'Expires on %(month)s/%(year)s' );
	translate( 'Card Number' );
	translate( 'Exp. Date' );
	translate( 'CVV' );
	translate( 'Search…' );
	translate( 'Page' );
	translate( 'Product' );
	translate( 'Untitled' );
	translate( 'View' );
	translate( 'Promote' );
	translate(
		'By clicking "Submit campaign" you agree to the {{linkTos}}Terms of Service{{/linkTos}} and {{linkAdvertisingPolicy}}Advertising Policy{{/linkAdvertisingPolicy}}, and authorize your payment method to be charged for the budget and duration you chose. {{linkMoreAboutAds}}Learn more{{/linkMoreAboutAds}} about how budgets and payments for Promoted Posts work.'
	);
	translate( 'Submit campaign' );
	translate( 'Make changes' );
	translate( 'Page Title' );
	translate( 'Summary' );
	translate( 'Ad Preview' );
	translate( 'Estimated Impressions' );
	translate( 'Max Budget' );
	translate( 'Languages' );
	translate( 'Devices' );
	translate( 'Destination' );
	translate( 'Loading site…' );
	translate( 'Preparing the wizard…' );
	translate( 'Fetching subscriptions…' );
	translate( 'Drop image here' );
	translate( 'Click or Drag an image here' );
	translate( '%(field)s is required.' );
	translate( 'This field is required.' );
	translate( 'All fields marked as required ({{span}}*{{/span}}) must be completed to continue' );
	translate( 'Pick a few categories, like food or movies, to narrow your audience.' );
	translate( 'All' );
	translate( 'Mobile' );
	translate( 'Desktop' );
	translate( 'hours ago', { context: 'message for recently created post' } );
	translate( '1 day ago', { context: 'message for post created yesterday' } );
	translate( '$%(creditUsed)s ($%(remainingCredit)s remain)', { context: 'amount of money' } );
	translate( 'Credits', { context: 'amount of money' } );
};

if ( window.BlazePress ) {
	window.BlazePress.strings = BlazePressStrings;
}
