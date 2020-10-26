# Jetpack Product Slide Out Card

This component is used to display a Jetpack product slide out card.

---

## How to use

```js
import JetpackProductSlideOutCard from 'calypso/components/jetpack/card/jetpack-product-slide-out-card';

export default function JetpackProductCardExample() {
	return (
		<JetpackProductSlideOutCard
			iconSlug="jetpack_backup_v2"
			productName="Jetpack Backup"
			currencyCode="USD"
			price={ 10 }
			billingTimeFrame="per month, billed monthly"
			buttonLabel="Get Backup"
			onButtonClick={ () => {
				/* do something */
			} }
		/>
	);
}
```

## Props

| Name                 | Type         | Default | Description                                                                |
| -------------------- | ------------ | ------- | -------------------------------------------------------------------------- |
| `className`          | `string`     | none    | Custom class added to the root element of the component                    |
| `iconSlug`\*         | `string`     | none    | Slug of the product icon                                                   |
| `productName`\*      | `string`     | none    | Name of the product, shown as the title of the card                        |
| `description`        | `React.Node` | none    | Description of the product                                                 |
| `currencyCode`\*     | `string`     | none    | Code of the currency in which to display the price                         |
| `price`\*            | `number`     | none    | Price of the product                                                       |
| `billingTimeFrame`\* | `string`     | none    | Use for the pricing details and timeframe, e.g. 'per month, billed yearly' |
| `badgeLabel`         | `string`     | none    | Label shown in the card badge                                              |
| `buttonLabel`\*      | `string`     | none    | Call-to-action of the button                                               |
| `buttonPrimary`\*    | `boolean`    | true    | Whether the button should be highlighted                                   |
| `onButtonClick`\*    | `function`   | none    | Callback called when the button is clicked                                 |
