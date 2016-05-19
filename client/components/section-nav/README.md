Section Navigation
==================

React component used to display a particular section's navigation bar. Or more traditionally, the sub navigation most commonly seen near the top of a page.

![Section Nav example screenshot](https://cldup.com/fu2XX6KTu6.png)

---

## Example Usage

```js
var SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavSegmented = require( 'components/section-nav/segmented' ),
	NavItem = require( 'components/section-nav/item' ),
	Search = require( 'components/search' );

module.exports = React.createClass( {

	// ...

	render: function() {
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
} );
```

Keep in mind that every `prop` referenced in the example can and *should* be dynamic. The parent component decides selection logic, text display, and hierarchy. Take a look at [pages](/client/my-sites/pages/pages.jsx) & [posts]((/client/my-sites/posts/posts-navigation.jsx)) for more working examples.

---

## Section Nav

The base component is `SectionNav` and acts as the wrapper for various control groups / other elements.

#### Props

`selectedText` - **required** (node - anything that can be rendered)

Text displayed in the header of the panel when rendered on mobile.

![selectedText example](https://cldup.com/796J06ggf0.png)

`selectedCount` - **optional** (Number)

Count displayed in the header of the panel.
---

## Nav Tabs

The tabs sub component will render items inline when there is enough horizontal room to do so. Otherwise it will render them as a dropdown beyond a certain screen size. The mobile version displays them vertically inside the panel.

![Nav Tabs Example](https://cldup.com/SG0UuJKr3i.png)

#### Props

`selectedText` - **required** (string)

Text displayed in the header when rendered as dropdown.

![selectedText example](https://cldup.com/Pdu7ypcBLS.png)

`selectedCount` - **optional** (Number)

Count displayed in the header when rendered as dropdown.

`label` - *optional* (string)

Text displayed above tabs group when:

* Mobile (`<480px`)
* `SectionNav` contains sibling level controls groups (more than one `NavTabs` or `NavSegmented`)

![label example](https://cldup.com/OeWSPtifYY.png)

---

## Nav Segmented

The segmented sub component utilizes [`SegmentedControl`](/client/components/segmented-control) to display `NavItems` inline.

![Nav Segmented Example](https://cldup.com/tPEfoQ78pR.png)

> Note: `SectionNav` relies on flex box techniques for sizing and that `NavSegmented` will not be allowed to overflow available horizontal space.

#### Props

`label` - *optional* (string)

Text displayed above tabs group when:

* Mobile (`<480px`)
* `SectionNav` contains sibling level controls groups (more than one `NavTabs` or `NavSegmented`)

![label example](https://cldup.com/OeWSPtifYY.png)

---

## Nav Item

These are the sub components that make up the children of both `NavTabs` & `NavSegmented`. They represent the options under each control group.

#### Props

`path` - *optional* (string)

URL to navigate to when clicked.

`selected` - *optional* (boolean)

Used for marking an item selected visually.

`onClick` - *optional* (function)

Additional function to be executed when item is clicked.

> Note: if `SectionNav` needs to execute some additional functionality on click, this function will still be executed and *not* overridden.

`tabIndex` - *optional* (number)

Used for accessibility and places option in a different `tab-index`. Default is `0`.

`disabled` - *optional* (boolean)

Prevents the item from being selected. Default is `false`.

`count` - *optional* (number)

Add an extra `item-count` element into nav item.
