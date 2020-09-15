# NPS Survey

This block is used to display a Net Promoter Score (NPS) survey to the user.

## Usage

```javascript
<NpsSurvey name="some_screen_v1" onClose={ this.handleSurveyClose } />;
```

## Props

- `name`: The name of the survey, used in reporting to segment by location survey
  was shown and version of survey. Each distinct location and version combo should
  have a unique name.
- `onClose`: A handler that is fired when the survey has been dismissed. A
  callback function will be passed to the handler that should be called after the survey is hidden.
