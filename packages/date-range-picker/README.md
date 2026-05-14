# @automattic/date-range-picker

A date-range picker built on top of `@automattic/ui`'s `DateRangeCalendar`. It
provides a popover-style trigger, keyboard-navigable preset shortcuts (last 7
days, month-to-date, etc.), accessible date inputs, and timezone-aware
site-day handling.

## Installation

```sh
npm install @automattic/date-range-picker
```

Consumers must also load the calendar styles from `@automattic/ui` and import
the picker's own stylesheet. The package ships SCSS source; compile it via
your own build pipeline (sass-loader, etc.):

```ts
import '@automattic/ui/style.css';
import '@automattic/date-range-picker/src/style.scss';
```

The SCSS expects `$grid-unit-*`, `$radius-small`, and `$gray-600` from
`@wordpress/base-styles` to be in scope (either via a global `@import` or via
sass-loader's `additionalData`).

## Usage

```tsx
import { DateRangePicker } from '@automattic/date-range-picker';

function Example() {
	const [ range, setRange ] = useState( { start: new Date(), end: new Date() } );

	return (
		<DateRangePicker
			start={ range.start }
			end={ range.end }
			onChange={ setRange }
			locale="en-US"
			timezoneString="America/New_York"
		/>
	);
}
```

### Props

| Prop                    | Type                                              | Default          | Description                                                                                                                |
| ----------------------- | ------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `start`                 | `Date`                                            | _required_       | Start of the selected range.                                                                                               |
| `end`                   | `Date`                                            | _required_       | End of the selected range.                                                                                                 |
| `onChange`              | `( next: { start: Date; end: Date } ) => void`    | _required_       | Called when the user applies a new range.                                                                                  |
| `locale`                | `string`                                          | _required_       | BCP 47 locale used to format the trigger label (e.g. `"en-US"`).                                                           |
| `timezoneString`        | `string`                                          | `undefined`      | Optional IANA timezone for the calendar (e.g. `"America/New_York"`).                                                       |
| `gmtOffset`             | `number`                                          | `undefined`      | Fallback offset in hours when `timezoneString` is not available.                                                           |
| `disableFuture`         | `boolean`                                         | `true`           | Disable days after today.                                                                                                  |
| `disabledBefore`        | `Date`                                            | `undefined`      | Disable days before this date.                                                                                             |
| `defaultFallbackPreset` | `PresetId`                                        | `'last-7-days'`  | Preset applied when the user clicks Apply with no dates selected.                                                          |
| `hiddenPresets`         | `PresetId[]`                                      | `[]`             | Presets to hide from the listbox. Use to scope down the default set per consumer.                                          |
| `inputsProps`           | `{ onStartFocus?, onEndFocus?, onStartBlur?, … }` | `undefined`      | Focus/blur callbacks for the date inputs (analytics hooks, etc.).                                                          |

### Exports

```ts
import {
	DateRangePicker,
	formatLabel,
	presetDefs,
	getActivePresetId,
	computePresetRange,
	type PresetId,
} from '@automattic/date-range-picker';
```

## Translations

The package uses `@wordpress/i18n` directly. Strings are extracted with the
default text domain; consumers can override the domain via their build
pipeline (e.g. Jetpack's `i18n-loader-webpack-plugin`).
