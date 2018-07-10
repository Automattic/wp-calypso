# withAPIData

`withAPIData` is a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html) for orchestrating REST API data fetching. Simply compose your component using `withAPIData` and a description of your component's data needs, and the requisite network requests will be performed automatically on your behalf.

Out of the box, it includes:

- Auto-fetching when your component mounts
- Reusing cached data if request has already been made
- Provides status updates so you can render accordingly
- Trigger creation, updates, or deletes on data

## Example:

Consider a post component which displays a placeholder message while it loads, and the post's title once it becomes available:

```jsx
function MyPost( { post } ) {
	if ( post.isLoading || 'undefined' === typeof post.data ) {
		return <div>Loading...</div>;
	}

	return <div>{ post.data.title.rendered }</div>;
}

export default withAPIData( ( props, { type } ) => ( {
	post: `/wp/v2/${ type( 'post' ) }/${ props.postId }`
} ) )( MyPost );
```

## Usage

`withAPIData` expects a function argument describing a mapping between prop keys and the REST API endpoint path. In the data mapping function, you have access to the component's incoming props, plus a few REST API helper utilities. It returns a function which can then be used in composing your component.

The REST API helpers currently include tools to retrieve the `rest_base` of a post type or taxonomy:

- `type( postType: String ): String`
- `taxonomy( taxonomy: String ): String`

Data-bound props take the shape of an object with a number of properties, depending on the methods supported for the particular endpoint:

- `GET`
   - `isLoading`: Whether the resource is currently being fetched
   - `data`: The resource, available once fetch succeeds
   - `get`: Function to invoke a new fetch request
   - `error`: The error object, if the fetch failed
- `POST`
   - `isCreating`: Whether the resource is currently being created
   - `createdData`: The created resource, available once create succeeds
   - `create`: Function to invoke a new create request
   - `createError`: The error object, if the create failed
- `PUT`
   - `isSaving`: Whether the resource is currently being saved
   - `savedData`: The saved resource, available once save succeeds
   - `save`: Function to invoke a new save request
   - `saveError`: The error object, if the save failed
- `PATCH`
   - `isPatching`: Whether the resource is currently being patched
   - `patchedData`: The patched resource, available once patch succeeds
   - `patch`: Function to invoke a new patch request
   - `patchError`: The error object, if the patch failed
- `DELETE`
   - `isDeleting`: Whether the resource is currently being deleted
   - `deletedData`: The deleted resource, available once delete succeeds
   - `delete`: Function to invoke a new delete request
   - `deleteError`: The error object, if the delete failed
