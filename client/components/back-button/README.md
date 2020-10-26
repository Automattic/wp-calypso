# Back Button

Simple back button, usually used in a HeaderCake to go back to the previous screen.

## Usage

```jsx
import BackButton from 'calypso/components/back-button';

function render() {
	return <BackButton onClick={ myClickHandler } />;
}
```

### Props

| Name        | Type       | Default | Description                       |
| ----------- | ---------- | ------- | --------------------------------- |
| `onClick`\* | `function` | null    | Called when the button is clicked |
