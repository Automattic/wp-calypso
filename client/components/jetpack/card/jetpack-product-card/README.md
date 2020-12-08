# Jetpack Product Card

This component is used to display a Jetpack product card.

---

## How to use

```js
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';

export default function JetpackProductCardExample() {
	return (
		<JetpackProductCard
			iconSlug="jetpack_backup_v2"
			productName="Jetpack Backup"
			currencyCode="USD"
			originalPrice={ 10 }
			billingTimeFrame="per month, billed monthly"
			buttonLabel="Get Backup"
			onButtonClick={ () => {
				/* do something */
			} }
			features={ [ { text: 'Automated WordPress backups' } ] }
		/>
	);
}
```

## Props

| Name                 | Type         | Default | Description                                                                                |
| -------------------- | ------------ | ------- | ------------------------------------------------------------------------------------------ |
| `className`          | `string`     | none    | Custom class added to the root element of the component                                    |
| `iconSlug`\*         | `string`     | none    | Slug of the product icon                                                                   |
| `productName`\*      | `string`     | none    | Name of the product, shown as the title of the card                                        |
| `productType`        | `string`     | none    | Product type (e.g. 'Daily', or 'Real Time'), appended to its name                          |
| `headingLevel`       | `number`     | 2       | Heading level of the HTML element wrapping the product name                                |
| `subheadline`        | `string`     | none    | Summary of the product                                                                     |
| `description`        | `React.Node` | none    | Description of the product                                                                 |
| `currencyCode`\*     | `string`     | none    | Code of the currency in which to display the price                                         |
| `originalPrice`\*    | `number`     | none    | Price of the product                                                                       |
| `discountedPrice`    | `number`     | none    | Discounted price of the product                                                            |
| `withStartingPrice`  | `boolean`    | `false` | Prepends the price with the mention 'from'                                                 |
| `billingTimeFrame`\* | `string`     | none    | Use for the pricing details and timeframe, e.g. 'per month, billed yearly'                 |
| `badgeLabel`         | `string`     | none    | Label shown in the card badge                                                              |
| `discountMessage`    | `string`     | none    | Highlighted text shown just above the call-to-action                                       |
| `buttonLabel`\*      | `string`     | none    | Call-to-action of the button                                                               |
| `onButtonClick`\*    | `function`   | none    | Callback called when the button is clicked                                                 |
| `cancelLabel`        | `string`     | none    | Label of the cancel button                                                                 |
| `onCancelClick`      | `function`   | none    | Callback called when the cancel button is clicked                                          |
| `isHighlighted`      | `boolean`    | `false` | Use to show the button in its primary variant                                              |
| `isOwned`            | `boolean`    | `false` | Use when the product is already owned or included in another product owned by the customer |
| `features`\*         | `Features`   | none    | Features of the product                                                                    |
| `isExpanded`         | `boolean`    | `false` | Use to expand the card and show the product features                                       |
| `isDeprecated`       | `boolean`    | `false` | Use to identify the plan as deprecated                                                     |
| `expiryDate`         | `Moment`     | none    | Expiry date of the product                                                                 |
