Section Navigation
===

Navigation element that is used to alternate among related views within the same section.

![Section Nav example screenshot](https://cldup.com/fu2XX6KTu6.png)

## Usage

```js
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';

export default class extends React.Component {
	// ...

	render() {
		var sectionNavSelectedText = (
			<span>
				<span>Published</span>
				<small>Everyone</small>
			</span>
		);

		return (
			<SectionNav selectedText={ sectionNavSelectedText }>
				<NavTabs label="Status" selectedText="Published">
					<NavItem path="/posts" selected={ true }>Published</NavItem>
					<NavItem path="/posts/drafts" selected={ false }>Drafts</NavItem>
					<NavItem path="/posts/scheduled" selected={ false }>Scheduled</NavItem>
					<NavItem path="/posts/trashed" selected={ false }>Trashed</NavItem>
				</NavTabs>

				<NavSegmented label="Author">
					<NavItem path="/posts/my" selected={ false }>Only Me</NavItem>
					<NavItem path="/posts" selected={ true }>Everyone</NavItem>
				</NavSegmented>

				<Search
					pinned
					fitsContainer
					onSearch={ this.doSearch }
					initialValue={ this.props.search }
					placeholder="Search Published..."
					analyticsGroup="Pages"
					delaySearch={ true }
				/>
			</SectionNav>
		);
	}
}
```

Keep in mind that every `prop` referenced in the example can and *should* be dynamic. The parent component decides selection logic, text display, and hierarchy. Take a look at [pages](/client/my-sites/pages/pages.jsx) & [post types]((/client/my-sites/post-type-filter/index.jsx)) for more working examples.

### Section Nav

The base component is `SectionNav` and acts as the wrapper for various control groups / other elements.

#### Props

Name | Type | Required | Default | Description
--- | --- | --- | --- | ---
`selectedText` | `node` | yes | `null` | Text displayed in the header of the panel when rendered on mobile. See [example](https://cldup.com/796J06ggf0.png).
`selectedCount` | `number` | no | `null` | Count displayed in the header section.

### Nav Tabs

The tabs sub component will render items inline when there is enough horizontal room to do so. Otherwise it will render them as a dropdown beyond a certain screen size. The mobile version displays them vertically inside the panel.

![Nav Tabs Example](https://cldup.com/SG0UuJKr3i.png)

#### Props

Name | Type | Required | Default | Description
--- | --- | --- | --- | ---
`selectedText` | `string` | yes | `null` | Text displayed in the header when rendered as dropdown. See [example](https://cldup.com/Pdu7ypcBLS.png).
`selectedCount` | `number` | no | `null` | Count displayed in the header when rendered as dropdown.
`label` | `string` | no | `null` | Text displayed above tabs group on Mobile (`<480px`) or when `SectionNav` contains sibling level controls groups (more than one `NavTabs` or `NavSegmented`). See [example](https://cldup.com/OeWSPtifYY.png).

### Nav Segmented

The segmented sub component utilizes [`SegmentedControl`](/client/components/segmented-control) to display `NavItems` inline.

![Nav Segmented Example](https://cldup.com/tPEfoQ78pR.png)

> Note: `SectionNav` relies on flex box techniques for sizing and that `NavSegmented` will not be allowed to overflow available horizontal space.

#### Props

Name | Type | Required | Default | Description
--- | --- | --- | --- | ---
`label` | `string` | no | `null` | Text displayed above tabs group on Mobile (`<480px`) or when `SectionNav` contains sibling level controls groups (more than one `NavTabs` or `NavSegmented`). See [example](https://cldup.com/OeWSPtifYY.png).

### Nav Item

These are the sub components that make up the children of both `NavTabs` & `NavSegmented`. They represent the options under each control group.

#### Props

Name | Type | Required | Default | Description
--- | --- | --- | --- | ---
`path` | `string` | no | `null` | URL to navigate to when clicked.
`selected` | `bool` | no | `false` | Used for marking an item selected visually.
`onClick` | `function` | no | `null` | Additional function to be executed when item is clicked. **Note**:  _If `SectionNav` needs to execute some additional functionality on click, this function will still be executed and *not* overridden._
`tabIndex` | `number` | no | `null` | Used for accessibility and places option in a different `tab-index`.
`disabled` | `bool` | no | `false` | Prevents the item from being selected.
`count` | `number` | no | `null` | Add an extra `item-count` element into nav item.

### General guidelines

* Tabs should represent the same kind of content, such as a list-view with different filters applied. Don’t use tabs to group content that is dissimilar.
* Only one active tab at a time.
* Counts should be abbreviated if it's longer than 3 digits.

## Related components

* To use a simple navigation header without tabs, use the [Headers](./headers) component.
* To use a simple header with actions, use the [SectionHeader](./section-header) component.