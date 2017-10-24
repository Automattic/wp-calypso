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

**Note: this will be expanded to include different kinds of fields, like constraints.**

```js
{
	field1: <promotion field>,
	field2: <promotion field>,
}
```

### Promotion Field Models

For each field in a promotion model, there is a model in the following format:

```js
{
	component: FormField Component,
	labelText: string,
	explanationText: string (optional),
	placeholderText: string (optional),
	isRequired: boolean (optional),
}
```

