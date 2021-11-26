# SignupCard

A simple component to be used as a container to group similar information about the signup process.

## Usage

```jsx
import CompactCard from './components/signup-card';

function render() {
	return (
		<div className="your-stuff">
			<SignupCard
				title={ __( 'Title of your card ' ) }
				icon="domains"
			>
				<span>Your stuff in a CompactCard</span>
			</SignupCard>
		</div>
	);
}
```