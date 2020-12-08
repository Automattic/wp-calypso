# Section Navigation

React component used to display a particular section's navigation bar. Or more traditionally, the sub navigation most commonly seen near the top of a page.

![Section Nav example screenshot](https://cldup.com/fu2XX6KTu6.png)

---

## Example Usage

```js
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavSegmented from 'calypso/components/section-nav/segmented';
import NavItem from 'calypso/components/section-nav/item';
import Search from 'calypso/components/search';

export default class extends React.Component {
	// ...

	render() {
		const sectionNavSelectedText = (
			<span>
				<span>Published</span>
				<small>Everyone</small>
			</span>
		);

		return (
			<SectionNav selectedText={ sectionNavSelectedText }>
				<NavTabs label="Status" selectedText="Published">
					<NavItem path="/posts" selected>
						Published
					</NavItem>
					<NavItem path="/posts/drafts" selected={ false }>
						Drafts
					</NavItem>
					<NavItem path="/posts/scheduled" selected={ false }>
						Scheduled
					</NavItem>
					<NavItem path="/posts/trashed" selected={ false }>
						Trashed
					</NavItem>
				</NavTabs>

				<NavSegmented label="Author">
					<NavItem path="/posts/my" selected={ false }>
						Only Me
					</NavItem>
					<NavItem path="/posts" selected>
						Everyone
					</NavItem>
				</NavSegmented>

				<Search
					pinned
					fitsContainer
					onSearch={ this.doSearch }
					initialValue={ this.props.search }
					placeholder="Search Published..."
					analyticsGroup="Pages"
					delaySearch
				/>
			</SectionNav>
		);
	}
}
```

Keep in mind that every `prop` referenced in the example can and _should_ be dynamic. The parent component decides selection logic, text display, and hierarchy. Take a look at [pages](/client/my-sites/pages/pages.jsx) & [post types](<(/client/my-sites/post-type-filter/index.jsx)>) for more working examples.

---

## Section Nav

The base component is `SectionNav` and acts as the wrapper for various control groups / other elements.

### Props

`selectedText` - **required** (node - anything that can be rendered)

Text displayed in the header of the panel when rendered on mobile.

![selectedText example](https://cldup.com/796J06ggf0.png)

`selectedCount` - **optional** (Number)

## Count displayed in the header of the panel

## Nav Tabs

The tabs sub component will render items inline when there is enough horizontal room to do so. Otherwise it will render them as a dropdown beyond a certain screen size. The mobile version displays them vertically inside the panel.

![Nav Tabs Example](https://cldup.com/SG0UuJKr3i.png)

### Props

`selectedText` - **required** (string)

Text displayed in the header when rendered as dropdown.

![selectedText example](https://cldup.com/Pdu7ypcBLS.png)

`selectedCount` - **optional** (Number)

Count displayed in the header when rendered as dropdown.

`label` - _optional_ (string)

Text displayed above tabs group when:

- Mobile (`<480px`)
- `SectionNav` contains sibling level controls groups (more than one `NavTabs` or `NavSegmented`)

![label example](https://cldup.com/OeWSPtifYY.png)

---

## Nav Segmented

The segmented sub component utilizes [`SegmentedControl`](/client/components/segmented-control) to display `NavItems` inline.

![Nav Segmented Example](https://cldup.com/tPEfoQ78pR.png)

> Note: `SectionNav` relies on flex box techniques for sizing and that `NavSegmented` will not be allowed to overflow available horizontal space.

### Props

`label` - _optional_ (string)

Text displayed above tabs group when:

- Mobile (`<480px`)
- `SectionNav` contains sibling level controls groups (more than one `NavTabs` or `NavSegmented`)

![label example](https://cldup.com/OeWSPtifYY.png)

---

## Nav Item

These are the sub components that make up the children of both `NavTabs` & `NavSegmented`. They represent the options under each control group.

### Props

`path` - _optional_ (string)

URL to navigate to when clicked.

`selected` - _optional_ (boolean)

Used for marking an item selected visually.

`onClick` - _optional_ (function)

Additional function to be executed when item is clicked.

> Note: if `SectionNav` needs to execute some additional functionality on click, this function will still be executed and _not_ overridden.

`tabIndex` - _optional_ (number)

Used for accessibility and places option in a different `tab-index`. Default is `0`.

`disabled` - _optional_ (boolean)

Prevents the item from being selected. Default is `false`.

`count` - _optional_ (number)

Add an extra `item-count` element into nav item.
