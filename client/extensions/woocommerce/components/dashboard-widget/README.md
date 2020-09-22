# DashboardWidget

This component sets up some basic styling for dashboard widgets. It allows for full-, half-, and third-width widgets in a row, and has responsive styling for smaller screens. There is also support for adding images, and a per-widget settings panel.

## How to use

```js
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import DashboardWidgetRow from 'woocommerce/components/dashboard-widget/row';

function render() {
	return (
		<DashboardWidgetRow>
			<DashboardWidget title="This is a widget title" image="calypso/images/example.svg">
				This content shows up in the widget body.
			</DashboardWidget>
		</DashboardWidgetRow>
	);
}
```

## Props `<DashboardWidget />`

- `className`: Additional classes
- `title`: Widget title, if set displays in an `h2` before the widget children
- `image`: Path to an image
- `imagePosition`: Alignment of image, one of `'bottom', 'left', 'right', 'top'`
- `imageFlush`: Should the image be flush with the widget border, defaults to `false`
- `settingsPanel`: A component with settings or widget info, displayed when the cog icon is clicked
- `onSettingsClose`: Function called when the settings panel is closed
- `width`: The width of this widget in a row, one of `'half', 'full', 'third', 'two-thirds'`

## Props `<DashboardWidgetRow />`

- `className`: Additional classes
