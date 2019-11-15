My Plan Card
=======

My Plan Card is a React component for rendering a box with plan or product name, description and icon, its expiry
date and a button to manage the payment.

It's meant to be used on `plans/my-plan` page to display plans and products that the user purchased.

See p1HpG7-7ET-p2 for more details.

### How to use the `<MyPlanCard />`

```jsx
import React from 'react';
import MyPlanCard from 'components/my-plan-card';

export default class extends React.Component {
	render() {
		return (
			<MyPlanCard
				buttonLabel="Manage Plan"
				buttonTarget="/me/purchases/"
				expirationDate="2020-10-27T10:37:04+00:00"
				plan="jetpack_personal"
				tagLine="Your data is being securely backed up and you have access to priority support."
				title="Jetpack Personal"
			/>
		);
	}
}
```

### `<MyPlanCard />` props

The following props can be passed to the My Plan Card component:

* `buttonLabel`: ( string ) Action button label
* `buttonTarget`: ( string ) Action button target (`href`)
* `expirationDate`: ( string ) Plan or product expiration date, e.g. `2019-11-14T16:53:25+00:00 ` (ISO 8601)
* `plan`: ( string ) Plan or product slug
* `tagLine`: ( string | element | node ) Plan or product tag line. It can be a string, a node or a React element (e.g. `<Fragment>`)
* `title`: ( string | element | node ) Plan or product title. It can be a string, a node or a React element (e.g. `<Fragment>`)
