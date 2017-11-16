Promotions
==========

The Promotions part of the Store appliction is a UI that is fulfilled by varied
data objects, including product sales and three kinds of coupons. As such, the
edit form is data driven by the fields that are available for each type of
promotion.

## `promotion-models.js`

The promotions models dictate the display and fields of the promotion that is
being edited. The `promotions-models.js` file exports a mapping of models indexed
by promotion type.

###	Promotion Models

For each promotion type, a model is returned in the following format:

```js
{
	cardModel1: {
		labelText: translate( 'Card 1' ),
		fields: {
			fieldModel1: <TextField />,
			fieldModel2: <CurrencyField />,
		},
	},
	cardModel2: {
		labelText: translate( 'Card 2' ),
		fields: {
			fieldModel3: <NumberField />,
			fieldModel4: <CheckboxField />,
		},
	},
}
```

### Promotion Field Components

For each field in a promotion model, there is a component that will be rendered.
In addition to whatever props are already set on the component from the model,
the following props will be added at runtime:

```js
{
	key: (the field name, for react iteration indexing),
	value: (the current value of the field),
	promotion: (the promotion the field belongs to),
	fieldName: (the field name used),
	edit: (edit function used to modify upon change, in the form of: function( fieldName, newValue ) ),
	currency: (the current currency to be used),
}
```
