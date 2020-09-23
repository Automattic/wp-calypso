# Promotions

The Promotions part of the Store appliction is a UI that is fulfilled by varied
data objects, including product sales and three kinds of coupons. As such, the
edit form is data driven by the fields that are available for each type of
promotion.

## `promotion-models.js`

The promotions models dictate the display and fields of the promotion that is
being edited. The `promotions-models.js` file exports a mapping of models indexed
by promotion type.

### Promotion Models

For each promotion type, a model is returned in the following format:

```js
const model = {
	cardModel1: {
		labelText: translate( 'Card 1' ),
		fields: {
			fieldModel1: {
				component: <TextField />,
				validate: ( fieldName, promotion, currency, showEmpty ) => {
					/*...*/
				},
			},
			fieldModel2: {
				component: <CurrencyField />,
				validate: ( fieldName, promotion, currency, showEmpty ) => {
					/*...*/
				},
			},
		},
	},
	cardModel2: {
		labelText: translate( 'Card 2' ),
		fields: {
			fieldModel3: {
				component: <NumberField />,
				validate: ( fieldName, promotion, currency, showEmpty ) => {
					/*...*/
				},
			},
			fieldModel4: {
				component: <CheckboxField />,
				validate: ( fieldName, promotion, currency, showEmpty ) => {
					/*...*/
				},
			},
		},
	},
};
```

### Promotion Field

Each promotion field will be rendered according to its model.

#### Components

For each field in a promotion model, there is a component that will be rendered.
In addition to whatever props are already set on the component from the model,
the following props will be added at runtime:

```js
const obj = {
	key, //the field name, for react iteration indexing)
	value, //the current value of the field)
	promotion, //the promotion the field belongs to)
	fieldName, //the field name used)
	edit, //edit function used to modify upon change, in the form of: function( fieldName, newValue ) )
	currency, //the current currency to be used)
};
```

#### Validate

The validation function for a promotion field is optional, but very useful.

It takes the following parameters:

- fieldName (string) The name of the promotion field being validated.
- promotion (Object) The promotion being validated.
- currency (string) The currency under which the validation is occurring.
- showEmpty (bool) True if the validator should issue errors for empty fields.

And it should return a translated text string to be displayed if a validation error is found.
Otherwise, returning `undefined` or some other falsy value.
