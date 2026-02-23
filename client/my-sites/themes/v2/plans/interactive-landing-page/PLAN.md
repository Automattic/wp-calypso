# Themes Showcase Interactive Landing Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully interactive Themes landing page using Landpack and the WordPress Interactivity API, decoupled from Calypso.

**Architecture:** A WordPress page composed of Landpack blocks (hero, banners, FAQs) and custom interactive blocks (`filter-bar`, `theme-grid`, `theme-card`) sharing the `themes-showcase` Interactivity API namespace. PHP renders the initial page server-side; the Interactivity API handles client-side interactions. Each grid block is independently configurable with its own data source.

**Tech Stack:** WordPress Interactivity API, Landpack, PHP, `@wordpress/scripts`, `@wordpress/interactivity`, wpcom REST API

**Design doc:** [DESIGN.md](./DESIGN.md)

**Repo:** `wpcom` (`wp-content/plugins/themes-showcase-blocks/`)

---

## Milestone 1: Plugin Scaffold + Filter Bar Block (~3-5 days)

### Task 1: Scaffold the plugin

**Files:**
- Create: `wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php`
- Create: `wp-content/plugins/themes-showcase-blocks/package.json`
- Create: `wp-content/plugins/themes-showcase-blocks/.gitignore`

**Step 1: Create the plugin bootstrap**

```php
<?php
/**
 * Plugin Name:       Themes Showcase Blocks
 * Description:       Interactive blocks for the WordPress.com Themes landing page.
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Version:           0.1.0
 * Text Domain:       themes-showcase-blocks
 *
 * @package themes-showcase-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register all blocks in the build directory.
 */
function themes_showcase_blocks_register() {
	$blocks_dir    = __DIR__ . '/build';
	$block_folders = glob( $blocks_dir . '/*', GLOB_ONLYDIR );

	foreach ( $block_folders as $block_folder ) {
		if ( file_exists( $block_folder . '/block.json' ) ) {
			register_block_type( $block_folder );
		}
	}
}
add_action( 'init', 'themes_showcase_blocks_register' );
```

**Step 2: Create package.json**

```json
{
  "name": "themes-showcase-blocks",
  "version": "0.1.0",
  "description": "Interactive blocks for the WordPress.com Themes landing page",
  "scripts": {
    "build": "wp-scripts build --experimental-modules",
    "start": "wp-scripts start --experimental-modules",
    "lint:js": "wp-scripts lint-js src/",
    "lint:css": "wp-scripts lint-style src/"
  },
  "devDependencies": {
    "@wordpress/scripts": "^30.0.0"
  },
  "dependencies": {
    "@wordpress/interactivity": "^6.0.0",
    "@wordpress/block-editor": "^14.0.0",
    "@wordpress/blocks": "^14.0.0",
    "@wordpress/components": "^29.0.0",
    "@wordpress/i18n": "^5.0.0"
  }
}
```

**Step 3: Create .gitignore**

```
node_modules/
build/
```

**Step 4: Install dependencies and verify build**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm install`
Run: `npm run build`
Expected: Build completes with no errors (no entry points yet, that's fine).

**Step 5: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/
git commit -m "feat: scaffold themes-showcase-blocks plugin"
```

---

### Task 2: Create the filter-bar block skeleton

**Files:**
- Create: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/block.json`
- Create: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/index.js`
- Create: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/edit.tsx`
- Create: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/render.php`
- Create: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/view.ts`
- Create: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/style.scss`

**Step 1: Create block.json**

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "themes-showcase/filter-bar",
  "version": "0.1.0",
  "title": "Themes Filter Bar",
  "category": "widgets",
  "icon": "filter",
  "description": "Category pills, plan tier dropdown, and search input for the Themes showcase.",
  "supports": {
    "interactivity": true,
    "html": false,
    "multiple": false
  },
  "textdomain": "themes-showcase-blocks",
  "editorScript": "file:./index.js",
  "render": "file:./render.php",
  "viewScriptModule": "file:./view.js",
  "style": "file:./style-index.css"
}
```

**Step 2: Create index.js (block registration)**

```js
import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';

registerBlockType( metadata.name, {
	edit: Edit,
} );
```

**Step 3: Create edit.tsx (editor placeholder)**

```tsx
import { useBlockProps } from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit() {
	return (
		<div { ...useBlockProps() }>
			<Placeholder
				icon="filter"
				label={ __( 'Themes Filter Bar', 'themes-showcase-blocks' ) }
				instructions={ __(
					'This block displays the filter bar on the front end.',
					'themes-showcase-blocks'
				) }
			/>
		</div>
	);
}
```

**Step 4: Create render.php (minimal server render)**

```php
<?php
/**
 * Filter Bar block server-side render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 *
 * @package themes-showcase-blocks
 */

// Hard-coded filters for initial scaffold. Will be replaced with API call.
$filters = array(
	array(
		'slug' => 'recommended',
		'name' => __( 'Recommended', 'themes-showcase-blocks' ),
	),
	array(
		'slug' => 'all',
		'name' => __( 'All', 'themes-showcase-blocks' ),
	),
);

$tiers = array(
	''          => __( 'All plans', 'themes-showcase-blocks' ),
	'free'      => __( 'Free', 'themes-showcase-blocks' ),
	'premium'   => __( 'Premium', 'themes-showcase-blocks' ),
	'partner'   => __( 'Partner', 'themes-showcase-blocks' ),
);

// Read initial state from URL.
$category     = 'recommended';
$tier         = '';
$search_query = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';

// Initialize global store state.
wp_interactivity_state(
	'themes-showcase',
	array(
		'category'    => $category,
		'tier'        => $tier,
		'searchQuery' => $search_query,
		'filters'     => $filters,
	)
);
?>

<div
	<?php echo get_block_wrapper_attributes( array( 'class' => 'themes-showcase-filter-bar' ) ); ?>
	data-wp-interactive="themes-showcase"
>
	<div class="themes-showcase-filter-bar__pills">
		<?php foreach ( $filters as $filter ) : ?>
			<button
				class="themes-showcase-filter-bar__pill"
				data-wp-on--click="actions.setCategory"
				data-wp-class--is-active="<?php echo esc_attr( 'state.category' ); ?>"
				data-wp-context="<?php echo esc_attr( wp_json_encode( array( 'filterSlug' => $filter['slug'] ) ) ); ?>"
				data-wp-bind--aria-pressed="<?php echo esc_attr( 'state.category' ); ?>"
			>
				<?php echo esc_html( $filter['name'] ); ?>
			</button>
		<?php endforeach; ?>
	</div>

	<div class="themes-showcase-filter-bar__controls">
		<select
			class="themes-showcase-filter-bar__tier-select"
			data-wp-on--change="actions.setTier"
			data-wp-bind--value="state.tier"
		>
			<?php foreach ( $tiers as $slug => $label ) : ?>
				<option value="<?php echo esc_attr( $slug ); ?>">
					<?php echo esc_html( $label ); ?>
				</option>
			<?php endforeach; ?>
		</select>

		<input
			type="search"
			class="themes-showcase-filter-bar__search"
			placeholder="<?php esc_attr_e( 'Search themes...', 'themes-showcase-blocks' ); ?>"
			data-wp-on--input="actions.setSearch"
			data-wp-bind--value="state.searchQuery"
			value="<?php echo esc_attr( $search_query ); ?>"
		/>
	</div>
</div>
```

**Step 5: Create view.ts (Interactivity API store)**

```ts
/**
 * WordPress dependencies
 */
import { store, getContext } from '@wordpress/interactivity';

type FilterBarContext = {
	filterSlug: string;
};

const { state } = store( 'themes-showcase', {
	state: {
		category: 'recommended',
		tier: '',
		searchQuery: '',
		filters: [] as Array< { slug: string; name: string } >,
	},
	actions: {
		setCategory() {
			const context = getContext< FilterBarContext >();
			state.category = context.filterSlug;

			const url = new URL( window.location.href );
			// Build path: /theme-showcase/{category}/{tier}
			let path = '/theme-showcase';
			if ( state.category && state.category !== 'recommended' ) {
				path += '/' + state.category;
			}
			if ( state.tier ) {
				path += '/' + state.tier;
			}
			url.pathname = path;
			window.history.pushState( {}, '', url.toString() );
		},
		setTier( event: Event ) {
			const target = event.target as HTMLSelectElement;
			state.tier = target.value;

			const url = new URL( window.location.href );
			let path = '/theme-showcase';
			if ( state.category && state.category !== 'recommended' ) {
				path += '/' + state.category;
			}
			if ( state.tier ) {
				path += '/' + state.tier;
			}
			url.pathname = path;
			window.history.pushState( {}, '', url.toString() );
		},
		setSearch( event: Event ) {
			const target = event.target as HTMLInputElement;
			const value = target.value;

			// Debounce: clear previous timeout, set new one.
			if ( ( state as any )._searchTimeout ) {
				clearTimeout( ( state as any )._searchTimeout );
			}
			( state as any )._searchTimeout = setTimeout( () => {
				state.searchQuery = value;

				const url = new URL( window.location.href );
				if ( value ) {
					url.searchParams.set( 's', value );
				} else {
					url.searchParams.delete( 's' );
				}
				window.history.pushState( {}, '', url.toString() );
			}, 300 );
		},
	},
} );
```

**Step 6: Create style.scss**

```scss
.themes-showcase-filter-bar {
	position: sticky;
	top: 0;
	z-index: 10;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
	padding: 16px 0;
	background: #fff;
	border-block-end: 1px solid #ddd;
}

.themes-showcase-filter-bar__pills {
	display: flex;
	gap: 8px;
	overflow-x: auto;
}

.themes-showcase-filter-bar__pill {
	padding: 8px 16px;
	border: 1px solid #ddd;
	border-radius: 20px;
	background: #fff;
	cursor: pointer;
	white-space: nowrap;
	font-size: 14px;
	line-height: 1;
	transition: background 0.15s, border-color 0.15s;

	&:hover {
		border-color: #1e1e1e;
	}

	&.is-active {
		background: #1e1e1e;
		border-color: #1e1e1e;
		color: #fff;
	}
}

.themes-showcase-filter-bar__controls {
	display: flex;
	gap: 8px;
	margin-inline-start: auto;
}

.themes-showcase-filter-bar__tier-select {
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
}

.themes-showcase-filter-bar__search {
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	min-inline-size: 200px;
}
```

**Step 7: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds. `build/filter-bar/` directory contains `index.js`, `render.php`, `view.js`, `style-index.css`, `block.json`.

**Step 8: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/filter-bar/
git commit -m "feat: add filter-bar block skeleton with Interactivity API store"
```

---

### Task 3: Wire filter bar to the theme-filters API

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/render.php`
- Modify: `wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php`

**Step 1: Add a helper function to fetch theme filters**

Add to `themes-showcase-blocks.php`:

```php
/**
 * Fetch theme filter categories from the wpcom API.
 *
 * @return array Array of filter objects with 'slug' and 'name' keys.
 */
function themes_showcase_blocks_get_filters() {
	$cache_key = 'themes_showcase_filters';
	$cached    = wp_cache_get( $cache_key );

	if ( false !== $cached ) {
		return $cached;
	}

	$response = wp_remote_get( 'https://public-api.wordpress.com/rest/v1.2/theme-filters' );

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return array();
	}

	$body    = json_decode( wp_remote_retrieve_body( $response ), true );
	$filters = array(
		array(
			'slug' => 'recommended',
			'name' => __( 'Recommended', 'themes-showcase-blocks' ),
		),
		array(
			'slug' => 'all',
			'name' => __( 'All', 'themes-showcase-blocks' ),
		),
	);

	if ( is_array( $body ) ) {
		foreach ( $body as $slug => $filter_data ) {
			if ( isset( $filter_data['name'] ) ) {
				$filters[] = array(
					'slug' => sanitize_key( $slug ),
					'name' => sanitize_text_field( $filter_data['name'] ),
				);
			}
		}
	}

	wp_cache_set( $cache_key, $filters, '', HOUR_IN_SECONDS );

	return $filters;
}
```

**Step 2: Update render.php to use the helper**

Replace the hard-coded `$filters` array in `render.php` with:

```php
$filters = themes_showcase_blocks_get_filters();
```

**Step 3: Add URL path parsing for initial category/tier**

Add to `render.php`, replacing the hard-coded `$category` and `$tier`:

```php
// Parse URL path segments for initial filter state.
// Expected format: /theme-showcase/{category}/{tier}
$request_path = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
$path_parts   = explode( '/', trim( wp_parse_url( $request_path, PHP_URL_PATH ), '/' ) );

// Remove the base path segment ("theme-showcase").
if ( ! empty( $path_parts ) && 'theme-showcase' === $path_parts[0] ) {
	array_shift( $path_parts );
}

$known_tiers = array( 'free', 'premium', 'marketplace', 'partner', 'woocommerce' );
$category    = 'recommended';
$tier        = '';

foreach ( $path_parts as $segment ) {
	if ( in_array( $segment, $known_tiers, true ) ) {
		$tier = $segment;
	} elseif ( '' !== $segment ) {
		$category = sanitize_key( $segment );
	}
}
```

**Step 4: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/
git commit -m "feat: wire filter-bar to theme-filters API with URL parsing"
```

---

### Task 4: Fix filter pill active state

The current `data-wp-class--is-active` binding on the pills compares against the global `state.category`, but it needs to compare the pill's own slug against the global state. The Interactivity API doesn't support expression bindings directly — we need a derived state getter or a callback approach.

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/render.php`
- Modify: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/view.ts`

**Step 1: Update render.php pill markup**

Replace each pill's `data-wp-class--is-active` with a `data-wp-watch` callback:

```php
<button
	class="themes-showcase-filter-bar__pill<?php echo $category === $filter['slug'] ? ' is-active' : ''; ?>"
	data-wp-on--click="actions.setCategory"
	data-wp-context="<?php echo esc_attr( wp_json_encode( array( 'filterSlug' => $filter['slug'] ) ) ); ?>"
	data-wp-bind--aria-pressed="callbacks.isPillActive"
	data-wp-watch="callbacks.updatePillActiveClass"
>
	<?php echo esc_html( $filter['name'] ); ?>
</button>
```

**Step 2: Add callbacks in view.ts**

```ts
import { store, getContext, getElement } from '@wordpress/interactivity';

// ... existing store definition, add to callbacks:

store( 'themes-showcase', {
	// ... existing state and actions ...
	callbacks: {
		isPillActive() {
			const context = getContext< FilterBarContext >();
			return state.category === context.filterSlug;
		},
		updatePillActiveClass() {
			const context = getContext< FilterBarContext >();
			const { ref } = getElement();
			if ( state.category === context.filterSlug ) {
				ref.classList.add( 'is-active' );
			} else {
				ref.classList.remove( 'is-active' );
			}
		},
	},
} );
```

**Step 3: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/filter-bar/
git commit -m "fix: correct filter pill active state binding"
```

---

## Milestone 2: Theme Grid Block (Fixed Mode) (~4-6 days)

### Task 5: Create the theme-grid block skeleton

**Files:**
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/block.json`
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/index.js`
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/edit.tsx`
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/render.php`
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/view.ts`
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/style.scss`

**Step 1: Create block.json**

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "themes-showcase/theme-grid",
  "version": "0.1.0",
  "title": "Themes Grid",
  "category": "widgets",
  "icon": "grid-view",
  "description": "Displays a grid of WordPress themes. Configurable data source and pagination.",
  "supports": {
    "interactivity": true,
    "html": false
  },
  "attributes": {
    "query": {
      "type": "object",
      "default": {}
    },
    "count": {
      "type": "number",
      "default": 12
    },
    "respondToFilters": {
      "type": "boolean",
      "default": false
    },
    "pagination": {
      "type": "string",
      "default": "none",
      "enum": [ "none", "infinite-scroll", "load-more" ]
    },
    "columns": {
      "type": "number",
      "default": 3
    }
  },
  "textdomain": "themes-showcase-blocks",
  "editorScript": "file:./index.js",
  "render": "file:./render.php",
  "viewScriptModule": "file:./view.js",
  "style": "file:./style-index.css"
}
```

**Step 2: Create index.js**

```js
import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';

registerBlockType( metadata.name, {
	edit: Edit,
} );
```

**Step 3: Create edit.tsx (editor controls for attributes)**

```tsx
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	RangeControl,
	TextControl,
	Placeholder,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

type Attributes = {
	query: Record< string, string >;
	count: number;
	respondToFilters: boolean;
	pagination: string;
	columns: number;
};

type Props = {
	attributes: Attributes;
	setAttributes: ( attrs: Partial< Attributes > ) => void;
};

export default function Edit( { attributes, setAttributes }: Props ) {
	const { count, respondToFilters, pagination, columns } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Grid Settings', 'themes-showcase-blocks' ) }>
					<RangeControl
						label={ __( 'Theme count', 'themes-showcase-blocks' ) }
						value={ count }
						onChange={ ( value ) =>
							setAttributes( { count: value ?? 12 } )
						}
						min={ 0 }
						max={ 100 }
						help={ __(
							'0 = unlimited (for infinite scroll)',
							'themes-showcase-blocks'
						) }
					/>
					<RangeControl
						label={ __( 'Columns', 'themes-showcase-blocks' ) }
						value={ columns }
						onChange={ ( value ) =>
							setAttributes( { columns: value ?? 3 } )
						}
						min={ 1 }
						max={ 6 }
					/>
					<ToggleControl
						label={ __(
							'Respond to filter bar',
							'themes-showcase-blocks'
						) }
						checked={ respondToFilters }
						onChange={ ( value ) =>
							setAttributes( { respondToFilters: value } )
						}
						help={ __(
							'When enabled, this grid updates when the filter bar changes.',
							'themes-showcase-blocks'
						) }
					/>
					<SelectControl
						label={ __( 'Pagination', 'themes-showcase-blocks' ) }
						value={ pagination }
						options={ [
							{ label: __( 'None', 'themes-showcase-blocks' ), value: 'none' },
							{
								label: __( 'Infinite scroll', 'themes-showcase-blocks' ),
								value: 'infinite-scroll',
							},
							{
								label: __( 'Load more button', 'themes-showcase-blocks' ),
								value: 'load-more',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { pagination: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				<Placeholder
					icon="grid-view"
					label={ __( 'Themes Grid', 'themes-showcase-blocks' ) }
					instructions={
						respondToFilters
							? __( 'This grid responds to the filter bar.', 'themes-showcase-blocks' )
							: __( 'This grid uses a fixed query.', 'themes-showcase-blocks' )
					}
				/>
			</div>
		</>
	);
}
```

**Step 4: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds. `build/theme-grid/` exists with all outputs.

**Step 5: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/theme-grid/
git commit -m "feat: add theme-grid block skeleton with editor controls"
```

---

### Task 6: Implement theme-grid server render

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/render.php`
- Modify: `wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php`

**Step 1: Add a helper to fetch themes from the wpcom API**

Add to `themes-showcase-blocks.php`:

```php
/**
 * Fetch themes from the wpcom REST API.
 *
 * @param array $args Query arguments:
 *   - filter   (string) Category/subject filter slug.
 *   - tier     (string) Plan tier slug.
 *   - search   (string) Search query.
 *   - number   (int)    Number of themes to fetch.
 *   - page     (int)    Page number.
 * @return array {
 *   themes: array of theme objects,
 *   found:  int total count,
 * }
 */
function themes_showcase_blocks_fetch_themes( $args = array() ) {
	$defaults = array(
		'filter' => '',
		'tier'   => '',
		'search' => '',
		'number' => 20,
		'page'   => 1,
	);
	$args = wp_parse_args( $args, $defaults );

	$api_url = 'https://public-api.wordpress.com/rest/v1.2/themes';
	$params  = array(
		'number' => $args['number'],
		'page'   => $args['page'],
		'apiVersion' => '1.2',
	);

	if ( ! empty( $args['filter'] ) && 'all' !== $args['filter'] && 'recommended' !== $args['filter'] ) {
		$params['filter'] = 'subject:' . $args['filter'];
	}
	if ( ! empty( $args['tier'] ) ) {
		$params['tier'] = $args['tier'];
	}
	if ( ! empty( $args['search'] ) ) {
		$params['search'] = $args['search'];
	}

	$url      = add_query_arg( $params, $api_url );
	$response = wp_remote_get( $url );

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return array(
			'themes' => array(),
			'found'  => 0,
		);
	}

	$body = json_decode( wp_remote_retrieve_body( $response ), true );

	return array(
		'themes' => isset( $body['themes'] ) ? $body['themes'] : array(),
		'found'  => isset( $body['found'] ) ? (int) $body['found'] : 0,
	);
}
```

**Step 2: Create render.php**

```php
<?php
/**
 * Theme Grid block server-side render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 *
 * @package themes-showcase-blocks
 */

$query             = isset( $attributes['query'] ) ? $attributes['query'] : array();
$count             = isset( $attributes['count'] ) ? (int) $attributes['count'] : 12;
$respond_to_filters = isset( $attributes['respondToFilters'] ) && $attributes['respondToFilters'];
$pagination        = isset( $attributes['pagination'] ) ? $attributes['pagination'] : 'none';
$columns           = isset( $attributes['columns'] ) ? (int) $attributes['columns'] : 3;

// Build the API query.
$api_args = array(
	'number' => $count > 0 ? $count : 20,
	'page'   => 1,
);

// Merge base query attributes.
if ( ! empty( $query['filter'] ) ) {
	$api_args['filter'] = sanitize_key( $query['filter'] );
}
if ( ! empty( $query['tier'] ) ) {
	$api_args['tier'] = sanitize_key( $query['tier'] );
}

// If responsive to filters, merge URL-derived filter state.
if ( $respond_to_filters ) {
	$request_path = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
	$path_parts   = explode( '/', trim( wp_parse_url( $request_path, PHP_URL_PATH ), '/' ) );

	if ( ! empty( $path_parts ) && 'theme-showcase' === $path_parts[0] ) {
		array_shift( $path_parts );
	}

	$known_tiers = array( 'free', 'premium', 'marketplace', 'partner', 'woocommerce' );

	foreach ( $path_parts as $segment ) {
		if ( in_array( $segment, $known_tiers, true ) ) {
			$api_args['tier'] = $segment;
		} elseif ( '' !== $segment && 'recommended' !== $segment ) {
			$api_args['filter'] = sanitize_key( $segment );
		}
	}

	$search_query = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
	if ( $search_query ) {
		$api_args['search'] = $search_query;
	}
}

// Fetch themes.
$result = themes_showcase_blocks_fetch_themes( $api_args );
$themes = $result['themes'];
$found  = $result['found'];

// Prepare context for Interactivity API.
$context = array(
	'themes'           => $themes,
	'page'             => 1,
	'totalCount'       => $found,
	'isLoading'        => false,
	'respondToFilters' => $respond_to_filters,
	'baseQuery'        => $query,
	'count'            => $count,
	'pagination'       => $pagination,
);

$grid_style = sprintf( '--themes-grid-columns: %d;', $columns );
?>

<div
	<?php echo get_block_wrapper_attributes( array( 'class' => 'themes-showcase-grid' ) ); ?>
	data-wp-interactive="themes-showcase"
	<?php echo wp_interactivity_data_wp_context( $context ); ?>
	style="<?php echo esc_attr( $grid_style ); ?>"
	<?php if ( $respond_to_filters ) : ?>
		data-wp-watch="callbacks.onFilterChange"
	<?php endif; ?>
>
	<div class="themes-showcase-grid__items">
		<?php foreach ( $themes as $theme ) : ?>
			<?php
			$screenshot = isset( $theme['screenshot'] ) ? $theme['screenshot'] : '';
			$name       = isset( $theme['name'] ) ? $theme['name'] : '';
			$slug       = isset( $theme['id'] ) ? $theme['id'] : '';
			$demo_uri   = isset( $theme['demo_uri'] ) ? $theme['demo_uri'] : '';
			$tier_label = '';
			if ( isset( $theme['theme_tier'] ) && isset( $theme['theme_tier']['slug'] ) ) {
				$tier_label = ucfirst( $theme['theme_tier']['slug'] );
				if ( 'free' === $theme['theme_tier']['slug'] ) {
					$tier_label = '';
				}
			}
			?>
			<div class="themes-showcase-card">
				<a href="<?php echo esc_url( '/theme/' . $slug ); ?>" class="themes-showcase-card__link">
					<?php if ( $screenshot ) : ?>
						<img
							class="themes-showcase-card__screenshot"
							src="<?php echo esc_url( $screenshot ); ?>"
							alt="<?php echo esc_attr( $name ); ?>"
							loading="lazy"
						/>
					<?php endif; ?>
					<div class="themes-showcase-card__info">
						<span class="themes-showcase-card__name"><?php echo esc_html( $name ); ?></span>
						<?php if ( $tier_label ) : ?>
							<span class="themes-showcase-card__tier"><?php echo esc_html( $tier_label ); ?></span>
						<?php endif; ?>
					</div>
				</a>
				<div class="themes-showcase-card__actions">
					<a href="<?php echo esc_url( '/theme/' . $slug ); ?>" class="themes-showcase-card__preview">
						<?php esc_html_e( 'Preview', 'themes-showcase-blocks' ); ?>
					</a>
					<?php if ( $demo_uri ) : ?>
						<a href="<?php echo esc_url( $demo_uri ); ?>" class="themes-showcase-card__demo" target="_blank" rel="noopener">
							<?php esc_html_e( 'Live Demo', 'themes-showcase-blocks' ); ?>
						</a>
					<?php endif; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>

	<?php if ( $respond_to_filters ) : ?>
		<div
			class="themes-showcase-grid__loading"
			data-wp-class--is-visible="context.isLoading"
		>
			<?php esc_html_e( 'Loading themes...', 'themes-showcase-blocks' ); ?>
		</div>
	<?php endif; ?>
</div>
```

**Step 3: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/
git commit -m "feat: implement theme-grid server render with wpcom API"
```

---

### Task 7: Implement theme-grid client-side filter reactivity

**Files:**
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/view.ts`
- Create: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/style.scss`

**Step 1: Create view.ts**

```ts
import { store, getContext, getElement, withScope } from '@wordpress/interactivity';

type ThemeObject = {
	id: string;
	name: string;
	screenshot: string;
	demo_uri: string;
	theme_tier?: { slug: string };
};

type GridContext = {
	themes: ThemeObject[];
	page: number;
	totalCount: number;
	isLoading: boolean;
	respondToFilters: boolean;
	baseQuery: Record< string, string >;
	count: number;
	pagination: string;
};

const API_BASE = 'https://public-api.wordpress.com/rest/v1.2/themes';

/**
 * Build API URL from filter state and grid config.
 */
function buildApiUrl(
	baseQuery: Record< string, string >,
	category: string,
	tier: string,
	search: string,
	count: number,
	page: number
): string {
	const params = new URLSearchParams();
	params.set( 'number', String( count > 0 ? count : 20 ) );
	params.set( 'page', String( page ) );

	// Base query filters.
	let filter = baseQuery.filter || '';
	let tierParam = baseQuery.tier || '';

	// Override with shared filter state if this grid responds to filters.
	if ( category && category !== 'recommended' && category !== 'all' ) {
		filter = 'subject:' + category;
	}
	if ( tier ) {
		tierParam = tier;
	}

	if ( filter ) {
		params.set( 'filter', filter );
	}
	if ( tierParam ) {
		params.set( 'tier', tierParam );
	}
	if ( search ) {
		params.set( 'search', search );
	}

	return API_BASE + '?' + params.toString();
}

// Access the shared store state (defined by filter-bar).
const { state } = store( 'themes-showcase', {
	callbacks: {
		/**
		 * Watches shared filter state and re-fetches themes when it changes.
		 * Only runs on grids with respondToFilters: true.
		 */
		onFilterChange() {
			const context = getContext< GridContext >();
			if ( ! context.respondToFilters ) {
				return;
			}

			// Access shared state to create reactive dependency.
			const { category, tier, searchQuery } = state;

			context.isLoading = true;
			context.page = 1;

			const url = buildApiUrl(
				context.baseQuery,
				category,
				tier,
				searchQuery,
				context.count,
				1
			);

			fetch( url )
				.then( ( response ) => response.json() )
				.then(
					withScope( ( data: { themes: ThemeObject[]; found: number } ) => {
						const ctx = getContext< GridContext >();
						ctx.themes = data.themes || [];
						ctx.totalCount = data.found || 0;
						ctx.isLoading = false;

						// Re-render the grid by updating innerHTML.
						const { ref } = getElement();
						const itemsContainer = ref.querySelector(
							'.themes-showcase-grid__items'
						);
						if ( itemsContainer ) {
							itemsContainer.innerHTML = ctx.themes
								.map( ( theme ) => renderCard( theme ) )
								.join( '' );
						}
					} )
				)
				.catch(
					withScope( () => {
						const ctx = getContext< GridContext >();
						ctx.isLoading = false;
					} )
				);
		},
	},
} );

/**
 * Render a theme card as an HTML string.
 * Used for client-side grid updates (avoids data-wp-each for performance).
 */
function renderCard( theme: ThemeObject ): string {
	const slug = theme.id || '';
	const name = theme.name || '';
	const screenshot = theme.screenshot || '';
	const demoUri = theme.demo_uri || '';
	const tierSlug = theme.theme_tier?.slug || '';
	const tierLabel = tierSlug && tierSlug !== 'free' ? tierSlug.charAt( 0 ).toUpperCase() + tierSlug.slice( 1 ) : '';

	return `
		<div class="themes-showcase-card">
			<a href="/theme/${ encodeURIComponent( slug ) }" class="themes-showcase-card__link">
				${ screenshot ? `<img class="themes-showcase-card__screenshot" src="${ screenshot }" alt="${ name }" loading="lazy" />` : '' }
				<div class="themes-showcase-card__info">
					<span class="themes-showcase-card__name">${ name }</span>
					${ tierLabel ? `<span class="themes-showcase-card__tier">${ tierLabel }</span>` : '' }
				</div>
			</a>
			<div class="themes-showcase-card__actions">
				<a href="/theme/${ encodeURIComponent( slug ) }" class="themes-showcase-card__preview">Preview</a>
				${ demoUri ? `<a href="${ demoUri }" class="themes-showcase-card__demo" target="_blank" rel="noopener">Live Demo</a>` : '' }
			</div>
		</div>
	`;
}
```

Note: This implementation uses manual DOM manipulation (`innerHTML`) instead of `data-wp-each` for the client-side re-render. This is the fallback strategy from the design doc's High-Risk #2 — it avoids potential `data-wp-each` performance issues with large lists and sidesteps the complexity of dynamic template rendering. If `data-wp-each` proves performant in practice, this can be refactored.

**Step 2: Create style.scss**

```scss
.themes-showcase-grid__items {
	display: grid;
	grid-template-columns: repeat( var( --themes-grid-columns, 3 ), 1fr );
	gap: 24px;

	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 2, 1fr );
	}

	@media ( max-width: 600px ) {
		grid-template-columns: 1fr;
	}
}

.themes-showcase-grid__loading {
	display: none;
	padding: 24px;
	text-align: center;
	color: #757575;

	&.is-visible {
		display: block;
	}
}

.themes-showcase-card {
	border: 1px solid #ddd;
	border-radius: 8px;
	overflow: hidden;
	transition: box-shadow 0.15s;

	&:hover {
		box-shadow: 0 2px 8px rgba( 0, 0, 0, 0.12 );
	}

	&:hover .themes-showcase-card__actions {
		opacity: 1;
	}
}

.themes-showcase-card__link {
	display: block;
	text-decoration: none;
	color: inherit;
}

.themes-showcase-card__screenshot {
	display: block;
	inline-size: 100%;
	aspect-ratio: 4 / 3;
	object-fit: cover;
}

.themes-showcase-card__info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
}

.themes-showcase-card__name {
	font-size: 14px;
	font-weight: 500;
}

.themes-showcase-card__tier {
	font-size: 12px;
	color: #757575;
	padding: 2px 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.themes-showcase-card__actions {
	display: flex;
	gap: 8px;
	padding: 0 16px 12px;
	opacity: 0;
	transition: opacity 0.15s;
}

.themes-showcase-card__preview,
.themes-showcase-card__demo {
	font-size: 13px;
	text-decoration: none;
	color: var( --wp--preset--color--blueberry, #3858e9 );
}
```

**Step 3: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/theme-grid/
git commit -m "feat: add theme-grid client-side filter reactivity with manual DOM render"
```

---

## Milestone 3: Infinite Scroll + Search (~3-4 days)

### Task 8: Add infinite scroll pagination

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/view.ts`
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/render.php`

**Step 1: Add sentinel element in render.php**

After the `themes-showcase-grid__loading` div, add:

```php
<?php if ( 'infinite-scroll' === $pagination && $found > $count ) : ?>
	<div
		class="themes-showcase-grid__sentinel"
		data-wp-init="callbacks.initInfiniteScroll"
	></div>
<?php endif; ?>
```

**Step 2: Add infinite scroll logic to view.ts**

Add to the store's `callbacks`:

```ts
/**
 * Sets up IntersectionObserver for infinite scroll.
 */
initInfiniteScroll() {
	const { ref } = getElement();

	const observer = new IntersectionObserver(
		withScope( ( entries: IntersectionObserverEntry[] ) => {
			const entry = entries[ 0 ];
			if ( ! entry.isIntersecting ) {
				return;
			}

			const context = getContext< GridContext >();
			if ( context.isLoading ) {
				return;
			}

			const loadedCount = context.themes.length;
			if ( loadedCount >= context.totalCount ) {
				observer.disconnect();
				return;
			}

			// Load next page.
			context.isLoading = true;
			context.page += 1;

			const { category, tier, searchQuery } = state;
			const url = buildApiUrl(
				context.baseQuery,
				context.respondToFilters ? category : '',
				context.respondToFilters ? tier : '',
				context.respondToFilters ? searchQuery : '',
				20, // Always fetch 20 per page for infinite scroll.
				context.page
			);

			fetch( url )
				.then( ( r ) => r.json() )
				.then(
					withScope( ( data: { themes: ThemeObject[]; found: number } ) => {
						const ctx = getContext< GridContext >();
						const newThemes = data.themes || [];
						ctx.themes = [ ...ctx.themes, ...newThemes ];
						ctx.totalCount = data.found || ctx.totalCount;
						ctx.isLoading = false;

						// Append new cards to the DOM.
						const { ref: gridRef } = getElement();
						const gridEl = gridRef.closest( '.themes-showcase-grid' );
						const container = gridEl?.querySelector(
							'.themes-showcase-grid__items'
						);
						if ( container ) {
							container.insertAdjacentHTML(
								'beforeend',
								newThemes.map( ( t ) => renderCard( t ) ).join( '' )
							);
						}
					} )
				)
				.catch(
					withScope( () => {
						const ctx = getContext< GridContext >();
						ctx.isLoading = false;
					} )
				);
		} ),
		{ rootMargin: '200px' }
	);

	observer.observe( ref );
},
```

**Step 3: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/theme-grid/
git commit -m "feat: add infinite scroll pagination to theme-grid"
```

---

### Task 9: Add loading states and empty state

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/render.php`
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/style.scss`

**Step 1: Add empty state to render.php**

After the `themes-showcase-grid__items` div, add:

```php
<?php if ( $respond_to_filters ) : ?>
	<div
		class="themes-showcase-grid__empty"
		data-wp-class--is-visible="callbacks.isGridEmpty"
	>
		<p><?php esc_html_e( 'No themes found matching your criteria.', 'themes-showcase-blocks' ); ?></p>
	</div>
<?php endif; ?>
```

**Step 2: Add the isGridEmpty callback in view.ts**

```ts
isGridEmpty() {
	const context = getContext< GridContext >();
	return ! context.isLoading && context.themes.length === 0;
},
```

**Step 3: Add empty state styles in style.scss**

```scss
.themes-showcase-grid__empty {
	display: none;
	padding: 48px 24px;
	text-align: center;
	color: #757575;
	font-size: 16px;

	&.is-visible {
		display: block;
	}
}
```

**Step 4: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/theme-grid/
git commit -m "feat: add loading and empty states to theme-grid"
```

---

## Milestone 4: SEO + URL Routing + Analytics (~3-5 days)

### Task 10: Add custom rewrite rules

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php`

**Step 1: Register rewrite rules**

Add to `themes-showcase-blocks.php`:

```php
/**
 * Register custom rewrite rules for the theme showcase URL patterns.
 *
 * Supports: /theme-showcase/{category}/{tier}
 */
function themes_showcase_blocks_rewrite_rules() {
	// Get the page ID for the theme showcase page.
	$page = get_page_by_path( 'theme-showcase' );
	if ( ! $page ) {
		return;
	}

	$page_id = $page->ID;

	// /theme-showcase/{category}/{tier}
	add_rewrite_rule(
		'^theme-showcase/([^/]+)/([^/]+)/?$',
		'index.php?page_id=' . $page_id . '&themes_category=$matches[1]&themes_tier=$matches[2]',
		'top'
	);

	// /theme-showcase/{category_or_tier}
	add_rewrite_rule(
		'^theme-showcase/([^/]+)/?$',
		'index.php?page_id=' . $page_id . '&themes_segment=$matches[1]',
		'top'
	);
}
add_action( 'init', 'themes_showcase_blocks_rewrite_rules' );

/**
 * Register custom query vars.
 *
 * @param array $vars Existing query vars.
 * @return array Modified query vars.
 */
function themes_showcase_blocks_query_vars( $vars ) {
	$vars[] = 'themes_category';
	$vars[] = 'themes_tier';
	$vars[] = 'themes_segment';
	return $vars;
}
add_filter( 'query_vars', 'themes_showcase_blocks_query_vars' );
```

**Step 2: Flush rewrite rules on activation**

```php
/**
 * Flush rewrite rules on plugin activation.
 */
function themes_showcase_blocks_activate() {
	themes_showcase_blocks_rewrite_rules();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'themes_showcase_blocks_activate' );

/**
 * Flush rewrite rules on plugin deactivation.
 */
function themes_showcase_blocks_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'themes_showcase_blocks_deactivate' );
```

**Step 3: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php
git commit -m "feat: add URL rewrite rules for filter paths"
```

---

### Task 11: Add dynamic SEO metadata

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php`

**Step 1: Add SEO metadata filter**

```php
/**
 * Dynamically adjust page title and meta description based on active filters.
 */
function themes_showcase_blocks_seo_metadata() {
	if ( ! is_page( 'theme-showcase' ) ) {
		return;
	}

	$category = get_query_var( 'themes_category', '' );
	$tier     = get_query_var( 'themes_tier', '' );
	$segment  = get_query_var( 'themes_segment', '' );

	// Disambiguate the single-segment case.
	$known_tiers = array( 'free', 'premium', 'marketplace', 'partner', 'woocommerce' );
	if ( $segment ) {
		if ( in_array( $segment, $known_tiers, true ) ) {
			$tier = $segment;
		} else {
			$category = $segment;
		}
	}

	$title_parts = array();
	if ( $category ) {
		$title_parts[] = ucfirst( $category );
	}
	if ( $tier ) {
		$title_parts[] = ucfirst( $tier );
	}
	$title_parts[] = __( 'WordPress Themes', 'themes-showcase-blocks' );

	$seo_title = implode( ' ', $title_parts ) . ' — WordPress.com';

	// Filter the document title.
	add_filter(
		'document_title_parts',
		function ( $parts ) use ( $seo_title ) {
			$parts['title'] = $seo_title;
			unset( $parts['site'] );
			return $parts;
		}
	);

	// Add canonical URL.
	add_action(
		'wp_head',
		function () use ( $category, $tier ) {
			$canonical = home_url( '/theme-showcase/' );
			if ( $category ) {
				$canonical .= $category . '/';
			}
			if ( $tier ) {
				$canonical .= $tier . '/';
			}
			echo '<link rel="canonical" href="' . esc_url( $canonical ) . '" />' . "\n";
		},
		1
	);
}
add_action( 'template_redirect', 'themes_showcase_blocks_seo_metadata' );
```

**Step 2: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php
git commit -m "feat: add dynamic SEO metadata for filter URLs"
```

---

### Task 12: Add Tracks analytics

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/view.ts`
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/view.ts`

**Step 1: Add a Tracks helper**

Create `wp-content/plugins/themes-showcase-blocks/src/utils/tracks.ts`:

```ts
/**
 * Fire a Tracks analytics event via the _tkq global.
 *
 * @param eventName The event name (e.g., 'wpcom_themes_filter_click').
 * @param properties Event properties object.
 */
export function recordTracksEvent(
	eventName: string,
	properties: Record< string, string | number | boolean > = {}
) {
	if ( typeof window !== 'undefined' && Array.isArray( ( window as any )._tkq ) ) {
		( window as any )._tkq.push( [ 'recordEvent', eventName, properties ] );
	}
}
```

**Step 2: Add tracking to filter-bar actions**

In `filter-bar/view.ts`, import and call the helper in each action:

```ts
import { recordTracksEvent } from '../utils/tracks';

// In setCategory action, after updating state:
recordTracksEvent( 'wpcom_themes_category_click', {
	category: context.filterSlug,
} );

// In setTier action, after updating state:
recordTracksEvent( 'wpcom_themes_tier_change', {
	tier: target.value,
} );

// In setSearch debounced callback, after updating state:
recordTracksEvent( 'wpcom_themes_search', {
	search_term: value,
} );
```

**Step 3: Add tracking to theme-grid card clicks**

In `theme-grid/view.ts`, add a card click handler:

```ts
import { recordTracksEvent } from '../utils/tracks';

// Add to store actions:
onCardClick() {
	const context = getContext< { themeSlug: string } >();
	recordTracksEvent( 'wpcom_themes_card_click', {
		theme: context.themeSlug,
	} );
},
```

**Step 4: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/
git commit -m "feat: add Tracks analytics to filter and theme interactions"
```

---

## Milestone 5: Polish + Validation (~3-4 days)

### Task 13: Accessibility pass

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/render.php`
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/render.php`

**Step 1: Add ARIA attributes to filter bar**

- Add `role="tablist"` to the pills container.
- Add `role="tab"` and `aria-selected` (bound to active state) to each pill.
- Add `aria-label` to search input and tier select.
- Add `role="status"` and `aria-live="polite"` to the loading indicator.

**Step 2: Add ARIA to the theme grid**

- Add `role="list"` to the grid items container.
- Add `role="listitem"` to each theme card.
- Add `aria-label` to the grid container with a description of its contents.
- Add `aria-busy` bound to `context.isLoading`.
- Add `role="status"` and `aria-live="polite"` to the loading and empty state elements.

**Step 3: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/
git commit -m "feat: add ARIA attributes for accessibility"
```

---

### Task 14: Responsive polish

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/src/filter-bar/style.scss`
- Modify: `wp-content/plugins/themes-showcase-blocks/src/theme-grid/style.scss`

**Step 1: Filter bar responsive styles**

```scss
@media ( max-width: 600px ) {
	.themes-showcase-filter-bar {
		flex-direction: column;
		align-items: stretch;
	}

	.themes-showcase-filter-bar__controls {
		margin-inline-start: 0;
		flex-direction: column;
	}

	.themes-showcase-filter-bar__search {
		min-inline-size: 0;
		inline-size: 100%;
	}
}
```

**Step 2: Theme card responsive adjustments**

```scss
@media ( max-width: 600px ) {
	.themes-showcase-card__actions {
		opacity: 1; // Always show actions on mobile (no hover).
	}
}
```

**Step 3: Build and verify**

Run: `cd wp-content/plugins/themes-showcase-blocks && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/src/
git commit -m "feat: responsive polish for filter bar and theme grid"
```

---

### Task 15: hrefLang for CJK locales

**Files:**
- Modify: `wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php`

**Step 1: Add hrefLang output**

```php
/**
 * Output hrefLang links for supported CJK locales.
 */
function themes_showcase_blocks_hreflang() {
	if ( ! is_page( 'theme-showcase' ) ) {
		return;
	}

	$locales = array(
		'ja' => 'ja',
		'zh-cn' => 'zh-Hans',
		'zh-tw' => 'zh-Hant',
		'ko' => 'ko',
	);

	$current_path = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/theme-showcase/';

	// Strip any existing locale prefix.
	$clean_path = preg_replace( '#^/(ja|zh-cn|zh-tw|ko)/#', '/', $current_path );

	// Output x-default.
	echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( home_url( $clean_path ) ) . '" />' . "\n";

	// Output each locale.
	foreach ( $locales as $prefix => $hreflang ) {
		$localized_url = home_url( '/' . $prefix . $clean_path );
		echo '<link rel="alternate" hreflang="' . esc_attr( $hreflang ) . '" href="' . esc_url( $localized_url ) . '" />' . "\n";
	}
}
add_action( 'wp_head', 'themes_showcase_blocks_hreflang', 2 );
```

**Step 2: Commit**

```bash
git add wp-content/plugins/themes-showcase-blocks/themes-showcase-blocks.php
git commit -m "feat: add hrefLang links for CJK locales"
```

---

## Summary

| Milestone | Tasks | Key Risk |
|-----------|-------|----------|
| 1: Plugin + Filter Bar | Tasks 1-4 | First contact with Interactivity API; store patterns |
| 2: Theme Grid (Fixed) | Tasks 5-7 | Cross-block communication; `data-wp-each` perf (mitigated via manual DOM) |
| 3: Infinite Scroll + Search | Tasks 8-9 | Combining IntersectionObserver with store; debounce |
| 4: SEO + Routing + Analytics | Tasks 10-12 | Rewrite rules; dynamic meta per filter combo |
| 5: Polish | Tasks 13-15 | Deterministic; may surface performance issues |

**Decision gates:**
- **After Task 7**: Does cross-block filter → grid communication work reliably? If not, merge filter-bar + main grid into a single block.
- **After Task 8**: Does infinite scroll with `withScope` callbacks work? If not, fall back to "Load More" button.
- **After Task 14**: Is performance acceptable? If `innerHTML` re-rendering is slow, investigate `data-wp-each` or chunked rendering.
