import { useTranslate } from 'i18n-calypso';

const PreemptiveTranslationsTest = () => {
	const translate = useTranslate();

	translate( 'LIMITED TIME OFFER' );
	translate( 'Save %s when you upgrade to a yearly plan', {
		args: [ 50 ],
		comment: '%s is percentual value, e.g. 50%',
	} );
	translate( 'Upgrade to a yearly plan and get:' );

	translate( 'An additional %s off of our usual yearly plan discount.', {
		args: [ 50 ],
		comment: '%s is percentual value, e.g. 50%',
	} );

	translate( "That's a %s discount in total!", {
		args: [ 50 ],
		comment: '%s is percentual value, e.g. 50%',
	} );

	translate( 'A free custom domain for one year.' );
	translate( 'Access to expert live chat support any time you need help with your site.' );
	translate( 'Discount ends in %s', {
		args: [ 50 ],
		comment: '%s is a date string, e.g. 6d 23h 59m 29s',
	} );

	translate( 'Claim offer' );
	translate( 'No thanks' );

	translate( 'Save %s when you purchase a two-year plan', {
		args: [ 50 ],
		comment: '%s is percentual value, e.g. 50%',
	} );

	translate( 'Upgrade to a two-year year plan today and save!' );

	translate(
		'For a limited time, get %s off when you upgrade your site and choose a two-year plan. Get the best value for your money and secure your website hosting for longer, so you don’t have to worry about renewing later.',
		{
			args: [ 50 ],
			comment: '%s is percentual value, e.g. 50%',
		}
	);

	translate( 'Save %s', {
		args: [ 50 ],
		comment: '%s is percentual value, e.g. 50%',
	} );

	return null;
};

export default PreemptiveTranslationsTest;
