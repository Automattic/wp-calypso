# Templates

A block template is defined as a list of block items. Such blocks can have predefined attributes, placeholder content, and be static or dynamic. Block templates allow to specify a default initial state for an editor session.

The scope of templates include:

- Setting a default state dynamically on the client. (like `defaultBlock`)
- Registered as a default for a given post type.

Planned additions:

- Saved and assigned to pages as "page templates".
- Defined in a `template.php` file or pulled from a custom post type (`wp_templates`) that is site specific.
- As the equivalent of the theme hierarchy.

## API

Templates can be declared in JS or in PHP as an array of blockTypes (block name and optional attributes).

```js
const template = [
  [ 'block/name', {} ], // [ blockName, attributes ]
];
```

```php
'template' => array(
	array( 'block/name' ),
),
```

## Custom Post types

A custom post type can register its own template during registration:

```php
function myplugin_register_book_post_type() {
	$args = array(
		'public' => true,
		'label'  => 'Books',
		'show_in_rest' => true,
		'template' => array(
			array( 'core/image', array(
				'align' => 'left',
			) ),
			array( 'core/heading', array(
				'placeholder' => 'Add Author...',
			) ),
			array( 'core/paragraph', array(
				'placeholder' => 'Add Description...',
			) ),
		),
	);
	register_post_type( 'book', $args );
}
add_action( 'init', 'myplugin_register_book_post_type' );
```

### Locking

Sometimes the intention might be to lock the template on the UI so that the blocks presented cannot be manipulated. This is achieved with a `template_lock` property.

```php
'template_lock' => 'all', // or 'insert' to allow moving
```

*Options:*

- `all` — prevents all operations. It is not possible to insert new blocks, move existing blocks, or delete blocks.
- `insert` — prevents inserting new blocks, but allows moving or removing existing blocks.

## Existing Post Types

It is also possible to assign a template to an existing post type like "posts" and "pages":

```php
function my_add_template_to_posts() {
	$post_type_object = get_post_type_object( 'post' );
	$post_type_object->template = array(
		array( 'core/paragraph', array(
			'placeholder' => 'Add Description...',
		) ),
	);
	$post_type_object->template_lock = 'all';
}
add_action( 'init', 'my_add_template_to_posts' );
```

## Nested Templates

Container blocks like the columns blocks also support templates. This is achieved by assigned a nested template to the block.

```php
$template = array(
	array( 'core/paragraph', array(
		'placeholder' => 'Add a root-level paragraph',
	) ),
	array( 'core/columns', array(), array(
		array( 'core/column', array(), array(
			array( 'core/image', array() ),
		) ),
		array( 'core/column', array(), array(
			array( 'core/paragraph', array(
				'placeholder' => 'Add a inner paragraph'
			) ),
		) ),
	) )
);
```
