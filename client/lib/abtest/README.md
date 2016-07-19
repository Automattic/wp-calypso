A/B Tests
=========

This module includes functionality for performing A/B tests in Calypso.

Turn on debugging in the JavaScript developer console to view details about what's going on behind the scenes while implementing A/B tests:

`localStorage.setItem('debug', 'calypso:abtests');`

# Usage

In `active-tests.js`, add your test info to the exported object:

```
module.exports = {
	freeTrialButtonWording: {
		datestamp: '20150216',
		variations: {
			startFreeTrial: 50,
			beginYourFreeTrial: 50
		},
		defaultVariation: 'startFreeTrial'
	}
};
```

You should include the following information:

* `datestamp` - The YYYMMDD date you want to start tracking the results of the test. If you deploy to production prior to this date, the `abtest` function (see below) will return the any stored variation (which makes for easier testing) or the value you set for `defaultVariation` and won't track the results.
* `variations` - An object where the keys are the variation names and the values are the allocations. The variation names should be descriptive (don't use `variationA`, `original`, etc). The allocations (50/50) are how you want those variations to be allocated to users. For example, you could also do 90/10 if you want one variation to be shown to only 10% of users. 90/10 is the same as 9/1. If you had three variations you could do 1/1/1 to show each variation one third of the time.
* `defaultVariation` - The variation to assign users who are not eligible to participate in the test. See the "Dealing with ineligible users" section below for more information.

There are also several optional configuration settings available:

* `excludeJetpackSites` - A/B tests run where a Jetpack site is selected will not be eligible for the test. Default is false (Jetpack sites are eligible).
* `excludeSitesWithPaidPlan` - A/B tests run on sites with a paid plan is selected will not be eligible for the test. Default is false (sites with paid plans are eligible).
* `allowAnyLocale` - Relaxes the locale restraint on the A/B test, allowing users of any locale to be allocated to a test.  Don't forget: this means strings will need to be translated.

Next, in your code, require the `abtest` module's `abtest` method:

```js
var abtest = require( 'lib/abtest' ).abtest;
```

The exported `abtest` method takes a test name and returns one of the variations you defined in the config file.

Here's how you would use it:

```
var buttonWording;

if ( abtest( 'freeTrialButtonWording' ) === 'startFreeTrial' ) {
    buttonWording = this.translate( 'Start Free Trial', { textOnly: true } );
} else {
    // Note: Don't make this translatable because it's only visible to English-language users
    buttonWording = 'Begin Your Free Trial';
}

<Button text={ buttonWording } />
```

You should keep the translation comment to make it clear to people reading the code why the string is not translated.

When this code runs the first time, we'll fire a `calypso_abtest_start` Tracks event with two properties: `abtest_name` and `abtest_variation`. This information is used by Tracks to help you analyze the impact of your test. For logged-in users, this event is fired via POST request to the `/me/abtest` endpoint and can be seen in a browser's network tab. For logged-out users, this event is fired via the [analytics.tracks.recordEvent method](https://github.com/Automattic/wp-calypso/tree/master/client/lib/analytics#tracks-api) and can be seen by watching the `calypso:analytics` string via [the debug module](https://github.com/Automattic/wp-calypso/blob/master/.github/CONTRIBUTING.md#debugging). The event is fired when there is no variant stored for a given test in localStorage. So you can trigger the event again by removing the record from localStorage.

Also, the user's variation is saved in local storage. You can see this in Chrome's dev tools by going to Resources > Local Storage > Calypso URL and viewing the `ABTests` key. If you'd like to force a specific variation while testing, you can simply change the value for your particular test then reload the page. In the example above, you'd change the value for `freeTrialButtonWording_20150216` to either `startFreeTrial` or `beginYourFreeTrial`.

## Determining whether the user is a participant in an A/B test

If you want to determine whether the user is a participant in a specific A/B test, you can require the `abtest` module's `getABTestVariation` method:

```
var getABTestVariation = require( 'lib/abtest' ).getABTestVariation;

// ...

// currentVariation will either be the variation or null if the user is not participating in the test
var currentVariation = getABTestVariation( 'freeTrialButtonWording' );
```

This is useful when your A/B test affects multiple pages and you just want to check on one page whether the user is a participant without assigning them to the test.

## Testing A Variation

If you would like to manually add yourself to a variant group to test it out visually, you can do so by modifying the `localStorage` setting for the test.  For the example above, to add yourself to the `beginYourFreeTrial` group you would execute:

```
// localStorage values are comprised of:
// localStorage.setItem('ABTests','{"<testObjectKey>_<datestamp>":"<variationName>"}')

localStorage.setItem('ABTests','{"freeTrialButtonWording_20150216":"beginYourFreeTrial"}')
```

The key used in the `ABTests` object above is comprised object key name from the test config object ( In our example `freeTrialButtonWording` ), followed by the `datestamp` of the test start date ( `20150216` in the example ).

## Measuring the impact of an A/B test

When you set up an A/B test, think about what you want to measure its impact on. For example, if you run a test within the NUX flow you might want to measure its impact on how many people successfully sign up for an account. We call this the _conversion event_.

You should make sure that the conversion event is being record in Tracks prior to deploying your A/B test. To create a new event, see the Tracks API section in the [Analytics README](https://wpcalypso.wordpress.com/devdocs/client/analytics/README.md).

## Ensuring users don't participate in future tests

After a test ends, you'll often want to run a follow up test to test new variations that affect the same thing. To do this, you can keep the `freeTrialButtonWording` name and simply update the datestamp and variations as appropriate.

We've found that if a user has already participated in a test for a specific thing (such as testing the wording on a specific button) we don't want to include them in future tests for it because it may throw off the results.

To account for this, the A/B test module is smart enough to know that if the user has already participated in a test with the same name (ie `freeTrialButtonWording`), then not to count them in the results of the new test.

## Dealing with ineligible users

By default, users are only included in the test if their locale is set to English (`en`), the current date is on or after the datestamp you set, they have not participated in a test with the same name in the past, and they registered on or after the date that the test started.

The locale restriction can be relaxed by adding `allowAnyLocale: true` to the test configuration.

In cases where the user is ineligible, the `abtest` function will return the value for `defaultVariation` value that you specify in the config file. This value should be one of the variations contained in `variations`.

No `calypso_abtest_start` Tracks event is triggered for these users so they don't impact the results of the test.
