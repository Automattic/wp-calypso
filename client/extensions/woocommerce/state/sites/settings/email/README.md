# Email Settings

This module is used to manage settings for products for a site.

## Actions

### `fetchEmailSettings( siteId: number )`

Pull email settings from the remote site. Does not run if the settings are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting settings), or a list of settings
as returned from the site's `settings_email_groups` API. WooCommerce options API organizes options in
groups (`group_id`). In each group various settings are organized by their id ( `id` ). Settings object
has different fields that describe the object. Because we are only interested in `value` the
`settings_email_groups` endpoint reponse has only `group_id` `id` and `value`. This can make things
confusing a bit because naming is not very consistent across various options. The top level element for
each option is `group_id` and that value is different for each object in response array. Each group can
have have the same `id` like for example `enabled` or `recipient` but as mentioned before it is for
different group.

```js
const object = {
	settings: {
		email: 'LOADING',
	},
};
```

Or

```js
const object = {
	settings: {
		email: [
			{
				group_id: 'email',
				id: 'woocommerce_email_from_name',
				value: '',
			},
			{
				group_id: 'email',
				id: 'woocommerce_email_from_address',
				value: '',
			},
			{
				group_id: 'email_new_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_new_order',
				id: 'recipient',
				value: 'admin_1@test.com',
			},
			{
				group_id: 'email_cancelled_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_cancelled_order',
				id: 'recipient',
				value: '',
			},
			{
				group_id: 'email_failed_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_failed_order',
				id: 'recipient',
				value: '',
			},
			{
				group_id: 'email_customer_on_hold_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_customer_processing_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_customer_completed_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_customer_refunded_order',
				id: 'enabled',
				value: 'yes',
			},
			{
				group_id: 'email_customer_new_account',
				id: 'enabled',
				value: 'yes',
			},
		],
	},
	/*...*/
};
```

## Selectors

### `areEmailSettingsLoaded( state, [siteId] )`

Whether the email settings has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areEmailSettingsLoading( state, [siteId] )`

Whether the email settings are currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getEmailSettings( state, siteId: number )`

Gets the email settings store in Redux state tree.
