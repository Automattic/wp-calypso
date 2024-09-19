# App Promo

This component is used to display the Mobile App Promo to users.

## How to use

```js
import AppPromo from 'calypso/blocks/app-promo';

function render() {
	return (
		<AppPromo 
			title="this is the title"
			iconSize="32"
			campaign="your-cool-campaing"
			subheader="this is a subheader"
			className="a-cool-class"
			hasQRCode
			hasGetAppButton={ false }
			/>
	);
}
```
