# Image

Image is a React component that wraps a normal `img` element and adds a class
to the image element if the image fails to load.

## Usage

```jsx
import Image from 'calypso/components/image';

const MyComponent = () => <Image src="http://example.com/fails" className="my-image" />;
```

## Props

All props will be transferred to the rendered `<img />` element.
