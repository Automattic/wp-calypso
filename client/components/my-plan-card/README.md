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
import Button from 'components/button';

export default class extends React.Component {
	render() {
		return (
			<MyPlanCard
				action={ <Button compact>Manage Payment</Button> }
				expiration="Expires on October 27, 2020"
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

* `action`: ( element | node ) Action button element or node.
* `isExpiring`: ( bool ) Flag indicating that the plan or product will expire soon
* `isPlaceholder`: ( bool ) Flag indicating that the component in is a loading state
* `expiration`: ( string ) Information about plan or product expiration or auto-renew date, e.g. `Expires on October 27, 2020`
* `plan`: ( string ) Plan or product slug
* `tagLine`: ( string | element | node ) Plan or product tag line. It can be a string, a node or a React element (e.g. `<Fragment>`)
* `title`: ( string | element | node ) Plan or product title. It can be a string, a node or a React element (e.g. `<Fragment>`)
