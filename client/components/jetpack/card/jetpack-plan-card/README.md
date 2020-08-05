# JetpackPlanCard

This component is used to display a Jetpack plan card.

---

#### How to use:

```js
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';

export default function JetpackPlanCardExample() {
	return (
		<div>
			<JetpackPlanCard { ...props } />
		</div>
	);
}
```

#### Props

| Name         | Type      | Default | Description                            |
| ------------ | --------- | ------- | -------------------------------------- |
| `deprecated` | `boolean` | `false` | Use to identify the plan as deprecated |

See other props at `components/jetpack/card/jetpack-product-card`;
