import { useTranslate } from 'i18n-calypso';

const BlazePressStrings = () => {
	const translate = useTranslate();
	translate( 'Calculating' );
	translate( 'Cannot calculate' );
	translate(
		'By clicking "Save and Submit" you agree to the {{linkTos}}Terms of Service{{/linkTos}} and {{linkAdvertisingPolicy}}Advertising Policy{{/linkAdvertisingPolicy}}, and authorize your payment method to be charged for the budget and duration you chose. {{linkMoreAboutAds}}Learn more{{/linkMoreAboutAds}} about how budgets and payments for Promoted Posts work.'
	);
	translate( 'All topics' );
	translate( 'Everywhere' );
	translate( 'Devices' );
	translate( 'Location' );
	translate( 'Interests' );
	translate( 'OS' );
	translate( 'days' );
	translate( 'Estimated impressions' );
	translate( 'Max budget' );
	translate( 'Duration' );
	translate( 'Ad Preview' );
	translate( 'Ad destination' );
	translate( 'Audience' );
	translate( 'Budget & Duration' );
	translate( 'Save' );
	translate( 'Save selection' );
	translate( 'Use post image' );
	translate( 'Upload' );
	translate( 'Use + / - or simply drag the image to adjust it' );
	translate( 'Payment' );
	translate( 'You won’t be charged until the ad is approved and starts running.' );
	translate( 'You can pause spending at any time.' );
	translate( 'Saved cards' );
	translate( 'Add new card' );
	translate( 'What will be the Goal?' );
	translate( 'Expand your target audience by adjusting audience setting' );
	translate( 'Budget' );
	translate( 'Daily budget' );
	translate( 'Between' );
	translate( 'Days' );
	translate( 'Max' );
	translate( 'Start date' );
	translate( 'Creating your Ad' );
	translate( 'Oops!' );
	translate( 'The campaign cannot be created. Please {{a}}contact our support team{{/a}}.' );
	translate( 'Go to campaigns' );
	translate( 'All set!' );
	translate(
		'The ad has been submitted for approval. We’ll send you a confirmation email once it’s approved and running.'
	);
	translate( 'Learn more about the' );
	translate( 'Advertising Policy' );
	translate(
		'Cannot create subscription. Please {{supportLink}}contact support{{/supportLink}} or try again later.'
	);
	translate( 'State field is required' );
	translate( 'Use saved card' );
	translate( 'First Name' );
	translate( 'Last Name' );
	translate( 'Address 1' );
	translate( 'Address 2' );
	translate( 'Country' );
	translate( 'State' );
	translate( 'State / Province / Region' );
	translate( 'City' );
	translate( 'Zip / Postal code' );
	translate( 'Save this card for future payments' );
	translate( 'Checking payment information' );
	translate( 'Appearance' );
	translate( 'Image' );
	translate( 'Title' );
	translate( '%(charactersLeft)s characters remaining' );
	translate( 'Snippet' );
	translate( 'Article Snippet' );
	translate( '%(snippetCharactersLeft)s characters remaining' );
	translate( 'Destination URL' );
	translate( 'The blog page' );
	translate( 'The site home' );
	translate( 'Card Number' );
	translate( 'Exp. Date' );
	translate( 'CVV' );
	translate( 'Pick a few categories, like food or movies, to narrow your audience.' );
	translate( 'Previous' );
	translate( 'Continue' );
	translate( 'Audience & Budget' );
	translate( 'Save and Submit' );
	translate( 'Next' );
	translate( 'Drop image here' );
	translate( 'Click or Drag an image here' );
	translate( 'All fields marked as required' );
	translate( 'must be completed to continue' );
	translate( 'All' );
	translate( 'Mobile devices' );
	translate( 'Desktop devices' );
	translate( 'Close' );
	translate( 'Learn more' );
	translate( 'Get started' );
	translate( 'Pick the right audience, budget and duration' );
	translate( 'Adjust your title to make it more engaging' );
	translate( 'Make the most of your Blaze campaign' );
	translate( 'Choose an eye-catching image for your ad' );
};

if ( window.BlazePress ) {
	window.BlazePress.strings = BlazePressStrings;
}
