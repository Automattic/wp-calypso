Query Help Courses
==================

`<QueryHelpCourses />` is a React component used in managing network requests for help courses.

## Usage

Render the component without any props as it doesn't need any. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryHelpCourses from 'components/data/query-help-courses';

export default ( { courses } ) => {
	return (
		<div>
			<QueryHelpCourses />
			{ courses.map( ( course ) => course.title ) }
		</div>
	);
}
```
