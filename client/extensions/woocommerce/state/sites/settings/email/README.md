Email Settings
================

This module is used to manage settings for products for a site.

## Actions

### `fetchEmailSettings( siteId: number )`

Pull email settings from the remote site. Does not run if the settings are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting settings), or a list of settings as returned from the site's `settings_email_groups` API.

```js
{
	"settings": {
		"email": "LOADING",
	}
	// or
	"settings": {
		"email": [
			{
				id: 'woocommerce_email_from_name',
				value: '',
				group_id: 'email',
			},
			{
				id: 'woocommerce_email_from_address',
				value: '',
				group_id: 'email',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_new_order',
			},
			{
				id: 'recipient',
				value: 'admin_1@test.com',
				group_id: 'email_new_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_cancelled_order',
			},
			{
				id: 'recipient',
				value: '',
				group_id: 'email_cancelled_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_failed_order',
			},
			{
				id: 'recipient',
				value: '',
				group_id: 'email_failed_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_on_hold_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_processing_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_completed_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_refunded_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_new_account',
			},
		];
	}, { … } ],
}
```

## Selectors

### `areEmailSettingsLoaded( state, [siteId] )`

Whether the email settings has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areEmailSettingsLoading( state, [siteId] )`

Whether the email settings are currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getEmailSettings( state, siteId: number )`

Gets the email settings store in Redux state tree.