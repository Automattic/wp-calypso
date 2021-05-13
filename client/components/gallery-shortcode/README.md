# Gallery Shortcode

Gallery Shortcode is a React component used in displaying galleries. It makes use of the [Shortcode component](../shortcode), rendering an `<iframe />` element containing the exact output as would be rendered to the site.

## Usage

Simply pass a site ID and an array of media items.

```jsx
import React from 'react';
import GalleryShortcode from 'calypso/components/gallery-shortcode';

export default class extends React.Component {
	static displayName = 'MyComponent';

	render() {
		return (
			<GalleryShortcode
				siteId={ 6393289 }
				items={ [ { ID: 31860 }, { ID: 31856 } ] }
				className="my-component"
			/>
		);
	}
}
```

## Props

The following props can be passed to the GalleryShortcode component. If a `className` is passed, it will be added to the rendered `.gallery-shortcode` element.

| property  | type           | required | default        | comment                                                                                                                                                                                                                                                                                                        |
| --------- | -------------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteId`  | Number         | yes      |                | The site ID for which to render the shortcode.                                                                                                                                                                                                                                                                 |
| `items`   | Array\<Media\> | no       | `[]`           | The media items to include in the rendered gallery.                                                                                                                                                                                                                                                            |
| `type`    | String         | no       | `"default"`    | The rendered style of the gallery. Available options include `default` (Thumbnail Grid), `rectangle` (Tiled Mosaic), `square` (Square Tiles), `circle` (Circles), `columns` (Tiled Columns), and `slideshow` (Slideshow). Defaults to `default`.                                                               |
| `columns` | Number         | no       | `3`            | The number of columns. The gallery will include a break tag at the end of each row, and calculate the column width as appropriate.                                                                                                                                                                             |
| `orderBy` | String         | no       | `"menu_order"` | The rendered order of the gallery. Available options include `menu_order` (order specified by the media modal), `title` (order by the title of the image in the Media Library), `post_date` (sort by date/time uploaded), `rand` (order randomly) and `ID` (order by media item ID). Defaults to `menu_order`. |
| `link`    | String         | no       | `''`           | The type of link that each image will link to. Available options include `''` (Empty string which specifies that the link goes to the image's attachment page), `file` (Link to the image file), `none` (No link). Defaults to `''` (attachment page).                                                         |
| `size`    | String         | no       | `"thumbnail"`  | The image size to use for the gallery thumbnail display. Available options include `thumbnail`, `medium`, `large`, `full` and any other additional image size that was registered with on the site. Defaults to `thumbnail`.                                                                                   |

## Resources

More information about the gallery shortcode can be found [at the WordPress Codex](https://codex.wordpress.org/Gallery_Shortcode).
