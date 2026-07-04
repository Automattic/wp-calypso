# @automattic/date-range-picker

A date-range picker built on top of `@automattic/ui`'s `DateRangeCalendar`. It
provides a popover-style trigger, keyboard-navigable preset shortcuts (last 7
days, month-to-date, etc.), accessible date inputs, optional time-of-day
inputs, and timezone-aware site-day handling.

## Installation

```sh
npm install @automattic/date-range-picker
```

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

The picker's stylesheet is side-effect imported from the component module, so a
plain `import { DateRangePicker }` is enough — there's no separate CSS import to
remember. The package ships pre-compiled CSS in `dist/`, so consumers don't
need a Sass loader.

### Props

| Prop                    | Type                                                                                 | Default         | Description                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------- |
| `start`                 | `Date`                                                                               | _required_      | Start of the selected range.                                                                               |
| `end`                   | `Date`                                                                               | _required_      | End of the selected range.                                                                                 |
| `onChange`              | `( next: { start: Date; end: Date; startTime?: string; endTime?: string } ) => void` | _required_      | Called when the user applies a new range. `startTime`/`endTime` are included when `showTimeInputs` is set. |
| `locale`                | `string`                                                                             | _required_      | BCP 47 locale used to format the trigger label (e.g. `"en-US"`).                                           |
| `timezoneString`        | `string`                                                                             | `undefined`     | Optional IANA timezone for the calendar (e.g. `"America/New_York"`).                                       |
| `gmtOffset`             | `number`                                                                             | `undefined`     | Fallback offset in hours when `timezoneString` is not available.                                           |
| `disableFuture`         | `boolean`                                                                            | `true`          | Disable days after today.                                                                                  |
| `disabledBefore`        | `Date`                                                                               | `undefined`     | Disable days before this date.                                                                             |
| `defaultFallbackPreset` | `PresetId`                                                                           | `'last-7-days'` | Preset applied when the user clicks Apply with no dates selected.                                          |
| `hiddenPresets`         | `PresetId[]`                                                                         | `[]`            | Presets to hide from the listbox. Use to scope down the default set per consumer.                          |
| `inputsProps`           | `{ onStartFocus?, onEndFocus?, onStartBlur?, … }`                                    | `undefined`     | Focus/blur callbacks for the date inputs (analytics hooks, etc.).                                          |
| `showTimeInputs`        | `boolean`                                                                            | `false`         | Show a start/end time-of-day input (`HH:MM`, site clock) paired under each date.                           |
| `startTime`             | `string`                                                                             | `'00:00'`       | Start time of day (`"HH:MM"`), used when `showTimeInputs` is set.                                          |
| `endTime`               | `string`                                                                             | `'23:59'`       | End time of day (`"HH:MM"`), used when `showTimeInputs` is set.                                            |

### Time of day

Set `showTimeInputs` to pair a `HH:MM` time input under each date. The times are
interpreted in the site clock, applied to the range as `startTime:00`–`endTime:59`
(so a whole-minute end is inclusive), and returned via `onChange`. When both times
are the whole-day defaults (`00:00`/`23:59`) the range is treated as date-only.

On Apply the boundaries are normalized so the start is never after the end: the
dates are ordered first (each time stays anchored to its start/end role, so the
defaults are preserved), then the times are ordered within a single day. A
cross-day window such as `17:00`→`09:00` the next day is a valid overnight range
and is left intact.

### Exports

```ts
import {
	DateRangePicker,
	formatLabel,
	presetDefs,
	getActivePresetId,
	computePresetRange,
	hasCustomTimeOfDay,
	DEFAULT_START_TIME,
	DEFAULT_END_TIME,
	type PresetId,
} from '@automattic/date-range-picker';
```

## Using outside Calypso

The package is published to npm and works for any React app — Jetpack, custom
WordPress plugins, etc. A few things to know:

### Required peer dependencies

The host application must install these alongside the picker:

- `react` and `react-dom` (`^18.3.1`)
- `@wordpress/components` (`>=33.1.0`)
- `@wordpress/compose` (`>=7.23.0`)
- `@wordpress/date` (`>=5.23.0`)
- `@wordpress/i18n` (`>=5.23.0`)
- `@wordpress/icons` (`>=10.23.0`)

These are peer dependencies (not bundled) so that the host can control the
exact version and avoid duplicate copies of WordPress packages — multiple
copies of `@wordpress/compose` will silently break hooks shared across the
picker and the host.

### Calendar styles

The picker renders `@automattic/ui`'s `DateRangeCalendar`. Make sure the
host loads its stylesheet once:

```ts
import '@automattic/ui/style.css';
```

### Skinning via CSS custom properties

The picker honours these CSS custom properties on a wrapping element, with
sensible defaults when they're not set:

| Custom property                         | Default   | Purpose                              |
| --------------------------------------- | --------- | ------------------------------------ |
| `--dashboard-surface__background-color` | `#fff`    | Trigger button background.           |
| `--dashboard__text-color`               | `#1e1e1e` | Trigger button text and icon colour. |
| `--dashboard-field__border-color`       | `#949494` | Trigger button border colour.        |

Set them on `:root` (or any ancestor of the picker) to theme it. The Calypso
dashboard shell sets these globally; outside Calypso, set whichever you'd like
to override.

## Translations

The package uses `@wordpress/i18n` directly. Strings are extracted with the
default text domain; consumers can override the domain via their build
pipeline (e.g. Jetpack's `i18n-loader-webpack-plugin`).
