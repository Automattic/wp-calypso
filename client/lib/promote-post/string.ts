import { useTranslate } from 'i18n-calypso';

const BlazePressStrings = () => {
	const translate = useTranslate();
	translate(
		'By clicking "Save & Create" you agree to the {{linkTos}}Terms of Service{{/linkTos}} and {{linkAdvertisingPolicy}}Advertising Policy{{/linkAdvertisingPolicy}}, and authorize your payment method to be charged for the budget and duration you chose. Learn more about how budgets and payments for Promoted Posts {{linkMoreAboutAds}}work{{/linkMoreAboutAds}}.'
	);
	translate( 'Calculating' );
	translate( 'error' );
	translate( 'Cannot calculate' );
	translate( 'All topics' );
	translate( 'Everywhere' );
	translate( 'Devices' );
	translate( 'Location' );
	translate( 'Interests' );
	translate( 'Estimated impressions' );
	translate( 'Total spent' );
	translate( 'Duration' );
	translate( 'days' );
	translate( 'Ad Preview' );
	translate( 'Ad destination' );
	translate( 'Audience' );
	translate( 'Budget & Duration' );
	translate( 'What will be the Goal?' );
	translate( 'Pick a few categories, like food or movies, to narrow your audience.' );
	translate( 'Expand your target audience by adjusting audience setting' );
	translate( 'Budget' );
	translate( 'Daily budget' );
	translate( 'Days' );
	translate( 'Start date' );
	translate( 'Creating an ad' );
	translate( 'Oops!' );
	translate( 'The campaign cannot be created. Please {{a}}contact our support team{{/a}}.' );
	translate( 'All set!' );
	translate(
		'The ad has been submitted for approval and we’ll send you a confirmation email once it’s approved and running.'
	);
	translate( 'Go to campaigns' );
	translate( 'Learn more about the' );
	translate( 'Advertising Policy' );
	translate(
		'Cannot create subscription. Please {{supportLink}}contact support{{/supportLink}} or try again later.'
	);
	translate( 'Payment' );
	translate( 'You won’t be charged until the ad is approved and starts running.' );
	translate( 'You can pause spending at any time.' );
	translate( 'First Name' );
	translate( 'Last Name' );
	translate( 'Address 1' );
	translate( 'Address 2' );
	translate( 'Country' );
	translate( 'State' );
	translate( 'City' );
	translate( 'Postcode' );
	translate( 'Creating subscription' );
	translate( 'Appearance' );
	translate( 'Image' );
	translate( 'Change' );
	translate( 'Hide Edit' );
	translate( 'Show Edit' );
	translate( 'For a 300x250 ad, the image has a 300x140 format.' );
	translate( 'Title' );
	translate( '%(charactersLeft)s characters remaining' );
	translate( 'Snippet' );
	translate( 'Article Snippet' );
	translate( '%(snippetCharactersLeft)s characters remaining' );
	translate( 'Destination URL' );
	translate( 'The site home' );
	translate( 'Card Number' );
	translate( 'Exp. Date' );
	translate( 'CVV' );
	translate( 'Previous' );
	translate( 'Continue' );
	translate( 'Audience & Budget' );
	translate( 'Save and Submit' );
	translate( 'Next' );
	translate( 'Drop image here' );
	translate( 'Click or Drag an image here' );
};

if ( window.BlazePress ) {
	window.BlazePress.strings = BlazePressStrings;
}
