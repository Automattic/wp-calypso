# Global Styles approach to Data <!-- omit in toc -->

Global Styles adds a new JSON REST API endpoint. It is a thin endpoint that outsources the data processing to the `\Automattic\Jetpack\Global_Styles\Data_Set` class, which implements a declarative approach to data retrieval and persistance.

In this document we'll go through the existing API:

- [Introduction](#introduction)
- [Literal Data Points](#literal-data-points)
- [Option Data Points](#option-data-points)
  - [Fallback Values](#fallback-values)
  - [Working with option's properties](#working-with-options-properties)
  - [Updatable Options](#updatable-options)
  - [Filters to prepare and sanitize data](#filters-to-prepare-and-sanitize-data)
- [Theme Data Points](#theme-data-points)
  - [Fallback Values](#fallback-values-1)
- [Working with theme's properties](#working-with-themes-properties)

## Introduction

The `\Automattic\Jetpack\Global_Styles\Data_Set` takes as input a declarative data format and knows how to process three kinds of data:

```php
// Initialize
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'font_list' => [
		'type' => 'literal',
		'default' => [
			'Arvo',
			'Libre Baskerville',
			'Ubuntu',
		],
	],
	'font_base_default' => [
		'type'    => 'theme',
		'name'    => [ 'jetpack-global-styles', 'font_base' ],
		'default' => 'Ubuntu',
	],
	'site_name' => [
		'type'    => 'option',
		'name'    => 'blogname',
		'default' => 'Your site name',
	],
] );

$data_set->get_data(); // Outputs data.
$data_set->save_data( $new_data ); // Updates data.
```

- **literal data points** are literal PHP values. These don't change over time and aren't saved to the database.
- **options data points** are values that come from the WordPress Options API. These can also be updated.
- **theme support data points** are values that come from the theme via `add_theme_support`.

## Literal Data Points

Data points are considered to be of the _literal_ kind if their `type` property value is `literal`. Their output is the literal PHP value in the `default` property, or `null` if none is provided.

For this **input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'font_base_default' => [
		'type'    => 'literal',
		'default' => 'Libre Baskerville',
	],
	'font_headings_default' => [
		'type'    => 'literal',
		'default' => 'Lora',
	],
] );
```

The **output** of `$data_set->get_data()` will be:

```php
[
	'font_base_default'     => 'Libre Baskerville',
	'font_headings_default' => 'Lora',
]
```

Note that the `default` property can contain any valid PHP data.

For example, use an array as **input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'font_options' => [
		'type'    => 'literal',
		'default' => [
			[
				'label' => 'Ubuntu Font',
				'value' => 'Ubuntu',
			],
			'Libre Baskerville',
			'Lora',
		],
	],
] );
```

The **output** of `$data_set->get_data()` will be:

```php
[
	'font_options' => [
		0 => [
			'label' => 'Ubuntu Font',
			'value' => 'Ubuntu',
		],
		1 => 'Libre Baskerville'
		2 => 'Lora',
	]
]
```

## Option Data Points

Data points are considered to be of the _option_ kind if the value of the `type` property is `option`. These are the only data points that can be updated.

The simplest use case is to operate with the contents of an option without further processing. This **input** can be expressed as:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'site_name' => [
		'type' => 'option',
		'name' => 'blogname',
	]
] );
```

The result of `$data_set->get_data()` will **output** the value of the `blogname` option in the database, or `false` if it doesn't exists or does not have a value:

```php
[
	'site_name' => 'A WordPress Site'
]
```

### Fallback Values

If the option does not exist or does not have a value, then the return value will be `false`, which replicates the WordPress Options API default behavior. In case you want to provide a fallback value, you can do so by using the `default` property.

**Input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'site_name' => [
		'type'    => 'option',
		'name'    => 'some_non_existing_option',
		'default' => 'My cool site name',
	]
] );
```

**Output** if option doesn't exist:

```php
[
	'site_name' => 'My cool site name'
]
```

### Working with option's properties

So far, we've exposed the whole option value. However, sometimes we want to unwrap an option and work with one of its properties instead.

For example, let's say that there is an option called `jetpack_global_styles` whose value is an object such as:

```php
[
	'font_base'     => 'Roboto',
	'font_headings' => 'Playfair Display',
]
```

For this **input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'font_base' => [
		'type' => 'option',
		'name' => [ 'jetpack_global_styles', 'font_base' ],
	]
] );
```

The **output** of `$data_set->get_data()` will be:

```php
[
	'font_base' => 'Roboto',
]
```

### Updatable Options

By default, options can't be updated and they won't be processed during the `$data_set->save_data( $new_data )` execution. For example, for this **input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'site_name' => [
		'type' => 'option',
		'name' => 'blogname',
	],
] );
$data_set->save_data(
	[
		'site_name' => 'A new site name'
	]
);
```

By default, the `blogname` option value **won't be processed** so the new value will be discarded.

Sometimes, though, we do want to update options. This can done by using the `updatable` key. Following the example above we set the option as updatable:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'site_name' => [
		'type'      => 'option',
		'name'      => 'blogname',
		'updatable' => true,
	],
] );
$data_set->save_data(
	[
		'site_name' => 'A new site name.'
	]
);
```

In this case, the `blogname` will be updated with the new value.

If we were working with specific properties of the option instead:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'font_base' => [
		'type'      => 'option',
		'name'      => [ 'jetpack_global_styles', 'font_base' ],
		'updatable' => true,
	],
] );
$data_set->save_data(
	[
		'font_base' => 'Domine'
	]
);
```

The result will be that the `jetpack_global_styles` option will have its `font_base` property updated, while the rest will keep the same values.

### Filters to prepare and sanitize data

**The `\Automattic\Jetpack\Global_Styles\Data_Set` doesn't do any validation or sanitization**, it's the consumer responsibility to do so. There are two filters that can be used to prepare, filter, validate and sanitize your data:

- `jetpack_global_styles_data_set_get_data`: it runs as the last step of `get_data()` and receives the result of processing the data points, so plugins have the opportunity to further processing it to their needs before it's used anywhere else.
- `jetpack_global_styles_data_set_save_data`: it runs as the first step of `save_data( $new_data )`, so plugins have the opportunity to validate and sanitize the incoming data to their needs before it's saved to the database.

## Theme Data Points

Data points are considered to be of the _theme_ kind if the property `type`'s value is `theme`.

**Input** being:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'jetpack_global_styles' => [
		'type' => 'theme',
		'name' => 'jetpack-global-styles',
	],
] );
```

This will pull data added via `add_theme_support` as in:

```php
add_theme_support(
	'jetpack-global-styles'
	[
		'font_headings' => 'Ubuntu',
	]
);
```

The **output** of `$data_set->get_data()` will be the value taken from theme support, or `null` if none was provided or the feature and/or property don't exist:

```php
[
	'jetpack_global_styles' => [
		'font_headings' => 'Ubuntu',
	],
]
```

### Fallback Values

If the theme has declared support for a feature but hasn't provided any value, the output for that data point be `null`. In case you want to provide a fallback value, you can do so by using the `default` property.

**Input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'jetpack_global_styles' => [
		'type'    => 'theme',
		'name'    => 'jetpack-global-styles',
		'default' => [
			'font_headings' => 'Lora',
		],
	],
] );
```

Being the `add_theme_support` declaration:

```php
add_theme_support( 'jetpack-global-styles' );
```

The **output** of `$data_set->get_data()` will be:

```php
[
	'jetpack_global_styles' =>[
		'font_headings' => 'Lora',
	]
]
```

## Working with theme's properties

It is also possible to work with specific properties, unwrapping the theme support data.

**Input**:

```php
$data_set = new \Automattic\Jetpack\Global_Styles\Data_Set( [
	'font_headings' => [
		'type'    => 'theme',
		'name'    => [ 'jetpack-global-styles', 'font_headings' ],
	],
] );
```

Being the `add_theme_support` declaration:

```php
add_theme_support(
	'jetpack-global-styles',
	[
		'font_base'      => 'Chivo',
		'font_headings'  => 'Ubuntu',
	]
);

```

The **output** of `$data_set->get_data()` will be:

```php
[
	'font_headings' => 'Ubuntu',
]
```
