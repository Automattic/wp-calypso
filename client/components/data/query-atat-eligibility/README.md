# Query Automated Transfer Eligibility

`<QueryAutomatedTransferEligibility />` is a React component used to manage requesting the eligibility information for a given WordPress.com site for conducting an automated transfer.

## Usage

Render the component, passing a `siteId`. It does not accept any children nor does it render any elements to the page.
You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```js
import React from 'react';
import { connect } from 'react-redux';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';

export function MyTransferView( { eligibility, siteId } ) {
	return (
		<div>
			<QueryEligibility siteId={ siteId } />
			<div>{ JSON.stringify( eligibility ) }</div>
		</div>
	);
}

const mapStateToProps = ( state, { siteId } ) => ( {
	eligibility: getEligibilityData( state, siteId ),
} );

export default connect( mapStateToProps )( MyTransferView );
```

### Props

| Name     | Type   | Required? | Note                         |
| -------- | ------ | --------- | ---------------------------- |
| `siteId` | number | yes       | References the intended site |
