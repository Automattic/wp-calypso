# Experience Control

A flexible component for capturing user experience feedback through a set of options. By default, it provides a three-state experience selector (Good, Neutral, Bad) with icons, but it can also be customized for different use cases.

## Usage

### Default Usage

```jsx
import { ExperienceControl } from '@automattic/components';

function MyComponent() {
	const [ experience, setExperience ] = useState( 'neutral' );

	return (
		<ExperienceControl
			label="How was your experience?"
			selectedExperience={ experience }
			onChange={ setExperience }
		/>
	);
}
```

### Custom Implementation

The component exports base components that can be used to create custom experience controls:

```jsx
import { ExperienceControl } from '@automattic/components';

function CustomExperienceControl() {
	const [ rating, setRating ] = useState( 'medium' );

	const options = [
		{ value: 'high', label: 'High Priority' },
		{ value: 'medium', label: 'Medium Priority' },
		{ value: 'low', label: 'Low Priority' },
	];

	return (
		<ExperienceControl.Base label="Task Priority" helpText="Help text">
			{ options.map( ( option ) => (
				<ExperienceControl.Option
					key={ option.value }
					className={ `is-${ option.value }` }
					isSelected={ rating === option.value }
					onClick={ () => setRating( option.value ) }
				>
					{ option.label }
				</ExperienceControl.Option>
			) ) }
		</ExperienceControl.Base>
	);
}
```

## Props

### ExperienceControl

| Prop                 | Type                         | Required | Description                                |
| -------------------- | ---------------------------- | -------- | ------------------------------------------ |
| `label`              | string                       | Yes      | The label displayed above the control      |
| `selectedExperience` | string                       | Yes      | The currently selected experience value    |
| `onChange`           | (experience: string) => void | Yes      | Callback when experience selection changes |
| `helpText`           | string                       | No       | Help text for the control                  |

### ExperienceControl.Base

| Prop       | Type      | Required | Description                           |
| ---------- | --------- | -------- | ------------------------------------- |
| `label`    | string    | Yes      | The label displayed above the control |
| `children` | ReactNode | Yes      | The button components to render       |
| `helpText` | string    | No       | Help text for the control             |

### ExperienceControl.Option

| Prop         | Type       | Required | Description                               |
| ------------ | ---------- | -------- | ----------------------------------------- |
| `className`  | string     | No       | Additional CSS class names                |
| `isSelected` | boolean    | Yes      | Whether this option is currently selected |
| `onClick`    | () => void | Yes      | Click handler for the option              |
| `children`   | ReactNode  | Yes      | The content to render inside the option   |
