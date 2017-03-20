NPS Survey
==========

This block is used to display a Net Promoter Score (NPS) survey to the user.

*Note: Currently still in development and not used in production yet.
The following is still outstanding:*

* Styling (the current implementation focused on getting the code structure
	in place, not concerning ourselves with the styling or wording yet)
* Wrapping strings for translation (since design and styling isn't finalized yet,
	no need to translate likely-to-change wording)
* Redux actions and state usage (this will likely remove the need for the
	`onDismissed` handler prop)

### Usage

```javascript
	<NpsSurvey
		name="some_screen_v1"
		onDismissed={ this.handleSurveyDismissed }
	/>
```

### Props

* `name`: The name of the survey, used in reporting to segment by location survey
	was shown and version of survey. Each distinct location and version combo should
	have a unique name.
* `onDismissed`: A handler that is fired when the survey has been dismissed. An
	event object with the following properties will be passed to the handler:
	* `wasSubmitted`: `true` if the survey was submitted, `false` if the user dismissed
		the survey without submitting it.
	* `surveyName`: The name of the survey.
	* `recommendationValue`: the value the user selected in the survey (0-10)
