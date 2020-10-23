# Tile Grid

## TileGrid (jsx)

Component used to declare an area for displaying Tiles — it's the main wrapper that takes care of tile alignment and positioning.

### Props

- `className`: Add your own class to the grid.

---

## Tile (jsx)

Component used to display a clickable tile with an image, call to action, and description.

### Props

- `buttonClassName`: Add your own class to the tile button.
- `buttonLabel`: Text of the button.
- `className`: Add your own class to the tile.
- `description`: Description text.
- `highlighted`: Whether the tile should be highlighted.
- `href`: URL that the item leads to upon click.
- `image`: URL of the image.
- `onClick`: Function, executed when the user clicks the tile.

---

### How to use

```js
import Tile from 'calypso/components/tile-grid/tile';
import TileGrid from 'calypso/components/tile-grid';

class MyExampleComponent extends PureComponent {
	render() {
		return (
			<TileGrid>
				<Tile
					buttonLabel={ 'Start with a blog' }
					description={ 'To share your ideas, stories, and photographs with your followers.' }
					image={ '/calypso/images/illustrations/type-blog.svg' }
					href={ 'https://wordpress.com/start' }
				/>
			</TileGrid>
		);
	}
}
```
