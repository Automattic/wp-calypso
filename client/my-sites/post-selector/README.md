PostSelector
============

The `PostSelector` component renders a list of Posts with corresponding form actions (radio or checkboxes) and a search box for filtering.  

## Usage

```jsx
import PostSelector from 'my-sites/post-selector';

<PostSelector siteId={ this.props.siteId } search={ this.state.searchTerm } />
```

### Required Props
- `siteId (Number)` - ID of the site to load posts for.

### Optional Props
- `type (String)` - Type of posts to show, either `page` or `post`.
- `status (String)` - Post/page status to use when querying.  Defaults to `publish,private`.
- `multiple (Boolean)` - If truthy, checkbox controls are shown in the selector allowing for multiple posts to be selected.  Defaults to false and radio controls are used to force a single selection.
- `onChange (Function)` - Callback function fired when a post is clicked on in the selector.
