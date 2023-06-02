# Download CSV

The download csv component creates a download link that allows a stats-list to be exported as a csv file. [browser-filesaver](https://github.com/tmpvar/browser-filesaver) performs the HTML5 file saving operations behind the scenes

## How to use

```js
import DownloadCsv from 'calypso/my-sites/stats/stats-download-csv';

const MyComponent = () => {
	return (
		<DownloadCsv
			statType={ statType /*string*/ }
			query={ query /*object*/ }
			path={ path /*string*/ }
			period={ period /*object*/ }
		/>
	);
};
```

## Required Props

- `period`: The period object is set by the stats controller and contains the type of period, and start/end date range that helps output a pretty file name for the CSV export
- `path`: The path is the stats summary section being used. Used for the csv file name along with recording the event in analytics.
- `statType`: The statType to download
- `query`: A query object used to request the stats data
