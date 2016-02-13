Query Video
===========

Query Video is a React component used in managing the fetching of metadata for VideoPress videos.

## Usage

Render the component, passing `guid`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React, { Component } from 'react';
import QueryVideo from 'components/data/query-video';

class WpVideoView extends Component {
	render() {
		return (
			<div>
				<QueryVideo guid={ this.props.guid  } />
				<iframe
					width = { this.props.video.width }
					height = { this.props.video.height }
					src={ this.props.embedUrl }
					frameBorder="0"
					allowFullScreen />
			</div>
		);
}

export default connect( ( state, props ) => {
	return {
		video: getVideo( state, props.guid )
	};
} )( WpVideoView );
```

## Props

### `guid`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The VideoPress guid of the video file to be queried.
