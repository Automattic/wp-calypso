# Stats

## Stats Components

These components handle the `\stats` section of Calypso. The stats section supports a variety of routes:

```
/stats
/stats/:time_period
/stats/:time_period/:site_id
```

### overview.jsx

This is the default view that is rendered at `\stats`. For users with more than 1 blog, a summary page of stats are shown for each site. Local storage is leveraged to make this experience load faster for the user when navigating between stat periods/sites.

### site.jsx

This is the detail view container for a specific sites stats data.

## Stats Controller

`controller.js` breaks the stats controller into its own individual component.

## Site Stats Modules

Within this directory we have also prefixed 'sub' components (aka metaboxes) used on the `site.jsx` with `module_`

- `module-authors.jsx`
- `module-chart.jsx`
- `module-countries.jsx`
- `module-date-picker.jsx`
- `module-geochart.jsx`
- `module-referrers.jsx`
- `module-tags-categories.jsx`
- `module-top-posts.jsx`

## Stats Data Components

Logic that interfaces with the API, or acts as a collection and / or interface into localStorage can be found within the `/client/stats` directory.

## External Modules

`moment.js` is being used to perform graceful date transforms and calculations of period dates ( end of week/month/year etc )
`store` is being used to persist metabox visibility state on the `site-stats` page
`throttle` is being used to - debounce - window resize events for the responsive visualizations.

## Stats List Markup

We have spent quite a bit of time to create an extensive set of markup for stats lists that provide hooks for default actions, and action menus depending on screen size. Below is some example markup:

### A Generic Stats List Item - No Action

```html
<li className="module-content-list-item module-content-list-item-normal">
	<span className="module-content-list-item-wrapper">
		<span className="module-content-list-item-right">
			<span className="module-content-list-item-value">9,999,999</span>
		</span>
		<span className="module-content-list-item-label">Default</span>
	</span>
</li>
```

#### Stats List Item - Link Row Action

```html
<li className="module-content-list-item module-content-list-item-link">
	<span className="module-content-list-item-wrapper">
		<span className="module-content-list-item-right">
			<span className="module-content-list-item-value">9,999,999</span>
		</span>
		<span className="module-content-list-item-label">Links somewhere</span>
	</span>
</li>
```

#### Stats List Item - With Additional Action Buttons

```html
<li className="module-content-list-item module-content-list-item-link">
	<span className="module-content-list-item-wrapper">
		<span className="module-content-list-item-right">
			<ul className="module-content-list-item-actions">
				<li className="module-content-list-item-action">
					<a href="#" className="module-content-list-item-action-wrapper"
						><Gridicon icon="external" /><span className="module-content-list-item-action-label"
							>View</span
						></a
					>
				</li>
				<li className="module-content-list-item-action">
					<a href="#" className="module-content-list-item-action-wrapper"
						><Gridicon icon="add-outline" /><span className="module-content-list-item-action-label"
							>Follow</span
						></a
					>
				</li>
			</ul>
			<span className="module-content-list-item-value">9,999,999,999,999</span>
		</span>
		<span className="module-content-list-item-label"
			>Links somewhere: Lorem ipsum dolor sit amet lorem ipsum dolor sit amet Lorem ipsum dolor sit
			amet lorem ipsum dolor sit amet</span
		>
	</span>
</li>
```

#### Kitchen Sink Example - Avatars, icons in Labels, Nested Lists

```html
<li
	className="module-content-list-item module-content-list-item-link module-content-list-item-large module-content-list-item-toggle is-expanded"
>
	<span className="module-content-list-item-wrapper">
		<span className="module-content-list-item-right">
			<span className="module-content-list-item-value">9,999,999</span>
		</span>
		<span className="module-content-list-item-label"
			><img
				className="avatar"
				src="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=64"
				width="32"
				height="32"
			/>Matt Mullenweg</span
		>
	</span>
	<ul className="module-content-list module-content-list-sublist">
		<li className="module-content-list-item module-content-list-item-link">
			<span className="module-content-list-item-wrapper">
				<span className="module-content-list-item-right">
					<ul className="module-content-list-item-actions">
						<li className="module-content-list-item-action">
							<a href="#" className="module-content-list-item-action-wrapper"
								><Gridicon icon="external" /><span className="module-content-list-item-action-label"
									>View</span
								></a
							>
						</li>
						<li className="module-content-list-item-action">
							<a href="#" className="module-content-list-item-action-wrapper"
								><Gridicon icon="pencil" /><span className="module-content-list-item-action-label"
									>Edit</span
								></a
							>
						</li>
					</ul>
					<span className="module-content-list-item-value">9,999,999</span>
				</span>
				<span className="module-content-list-item-label"
					><Gridicon icon="stats" />Blog Post Title Here</span
				>
			</span>
		</li>
		<li className="module-content-list-item module-content-list-item-link">
			<span className="module-content-list-item-wrapper">
				<span className="module-content-list-item-right">
					<ul className="module-content-list-item-actions">
						<li className="module-content-list-item-action">
							<a href="#" className="module-content-list-item-action-wrapper"
								><Gridicon icon="external" /><span className="module-content-list-item-action-label"
									>View</span
								></a
							>
						</li>
						<li className="module-content-list-item-action">
							<a href="#" className="module-content-list-item-action-wrapper"
								><Gridicon icon="pencil" /><span className="module-content-list-item-action-label"
									>Edit</span
								></a
							>
						</li>
					</ul>
					<span className="module-content-list-item-value">9,999,999</span>
				</span>
				<span className="module-content-list-item-label"
					><Gridicon icon="stats" />Blog Post Title Here</span
				>
			</span>
		</li>
		<li
			className="module-content-list-item module-content-list-item-link module-content-list-item-toggle is-expanded"
		>
			<span className="module-content-list-item-wrapper">
				<span className="module-content-list-item-right">
					<span className="module-content-list-item-value">9,999,999</span>
				</span>
				<span className="module-content-list-item-label"
					><Gridicon icon="search" />Search Engines</span
				>
			</span>
			<ul className="module-content-list module-content-list-sublist">
				<li className="module-content-list-item module-content-list-item-link">
					<span className="module-content-list-item-wrapper">
						<span className="module-content-list-item-right">
							<ul className="module-content-list-item-actions">
								<li
									className="module-content-list-item-action module-content-list-item-action-hidden"
								>
									<a href="#" className="module-content-list-item-action-wrapper"
										><Gridicon icon="flag" /><span className="module-content-list-item-action-label"
											>Spam?</span
										></a
									>
								</li>
							</ul>
							<span className="module-content-list-item-value">9,999,999</span>
						</span>
						<span className="module-content-list-item-label"
							><img
								className="avatar"
								src="https://secure.gravatar.com/blavatar/287dd4d7d2e174b5e7ffccaefd03da6c?s=64"
								width="32"
								height="32"
							/>theme.wordpress.com/themes/features/photography/?sort=undefined</span
						>
					</span>
				</li>
				<li className="module-content-list-item module-content-list-item-link">
					<span className="module-content-list-item-wrapper">
						<span className="module-content-list-item-right">
							<ul className="module-content-list-item-actions">
								<li
									className="module-content-list-item-action module-content-list-item-action-hidden"
								>
									<a href="#" className="module-content-list-item-action-wrapper"
										><Gridicon icon="flag" /><span className="module-content-list-item-action-label"
											>Spam?</span
										></a
									>
								</li>
							</ul>
							<span className="module-content-list-item-value">9,999,999</span>
						</span>
						<span className="module-content-list-item-label"
							><Gridicon
								icon="globe"
							/>theme.wordpress.com/themes/features/photography/?sort=undefined</span
						>
					</span>
				</li>
				<li className="module-content-list-item module-content-list-item-link">
					<span className="module-content-list-item-wrapper">
						<span className="module-content-list-item-right">
							<ul className="module-content-list-item-actions">
								<li
									className="module-content-list-item-action module-content-list-item-action-hidden"
								>
									<a href="#" className="module-content-list-item-action-wrapper"
										><Gridicon icon="flag" /><span className="module-content-list-item-action-label"
											>Spam?</span
										></a
									>
								</li>
							</ul>
							<span className="module-content-list-item-value">9,999,999</span>
						</span>
						<span className="module-content-list-item-label"
							><Gridicon
								icon="globe"
							/>theme.wordpress.com/themes/features/photography/?sort=undefined</span
						>
					</span>
				</li>
				<li className="module-content-list-item module-content-list-item-link">
					<span className="module-content-list-item-wrapper">
						<span className="module-content-list-item-right">
							<ul className="module-content-list-item-actions">
								<li
									className="module-content-list-item-action module-content-list-item-action-hidden"
								>
									<a href="#" className="module-content-list-item-action-wrapper"
										><Gridicon icon="flag" /><span className="module-content-list-item-action-label"
											>Spam?</span
										></a
									>
								</li>
							</ul>
							<span className="module-content-list-item-value">9,999,999</span>
						</span>
						<span className="module-content-list-item-label"
							><Gridicon
								icon="globe"
							/>theme.wordpress.com/themes/features/photography/?sort=undefined</span
						>
					</span>
				</li>
				<li className="module-content-list-item module-content-list-item-link">
					<span className="module-content-list-item-wrapper">
						<span className="module-content-list-item-right">
							<ul className="module-content-list-item-actions">
								<li
									className="module-content-list-item-action module-content-list-item-action-hidden"
								>
									<a href="#" className="module-content-list-item-action-wrapper"
										><Gridicon icon="flag" /><span className="module-content-list-item-action-label"
											>Spam?</span
										></a
									>
								</li>
							</ul>
							<span className="module-content-list-item-value">9,999,999</span>
						</span>
						<span className="module-content-list-item-label"
							><Gridicon
								icon="globe"
							/>theme.wordpress.com/themes/features/photography/?sort=undefined</span
						>
					</span>
				</li>
			</ul>
		</li>
	</ul>
</li>
```
