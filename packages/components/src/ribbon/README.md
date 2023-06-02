# Ribbon (JSX)

Ribbon is a component you can slap on a Card or a similar container to distinguish it in
some way. Ribbons came to us in the early 2010s when they were put on every container on the web.
Since then, the internet’s love for ribbons have subsided, but they will always find a
place in our hearts.

---

## How to use

```js
import { Card, Ribbon } from '@automattic/components';

function MyCard() {
	return (
		<Card>
			<Ribbon color="green">Default</Ribbon>
			<p>Some text</p>
		</Card>
	);
}
```

---

## Props

- `color`: (string) The color of the ribbon. Currently only supports green.
