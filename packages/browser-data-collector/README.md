# Browser Data Collector

This package is used to collect RUM data and send it to Logstash

## Usage

```js
import { start, stop } from '@automattic/browser-data-collector';

start( 'my-page', { fullPageLoad: true } );

// Later in the same page
stop( 'my-page' );
```

This will send a report to `Logstash` including (but not limited to):

- `duration`: when `stop()` was called relative to when `start()` was called. If `fullPageLoad:true`, then it is relative to when the navigation started.
- `id`: name of the report, `"my-page"` in this case
- Environment data like Calypso version or build target
- Data from the Performance Timing API

Sending reports is sampled to avoid overwhelming the REST endpoint. This logic is in `should-send.ts`. The full report is available in that function, so
we can decide if a report should be sent not only based on the id, but on any property captured by a collector.

## Architecture

We use the following concepts:

- Report: an object with the collected data. Has an id, start, end and extra metadata. Is the thing sent to Logstash as payload
- Collector: function that aguments an existing Report with extra metadata.
- Global Collectors: list of collectors that are applied to all reports.
- Transport: a mechanism to send a Report to a backend system. For now only Logstash is implemneted.
- API: Adapter used to talk to a Browser API (or more generically, an external datasource). These modules are used by collectors to fetch the data that should be added to a report.
