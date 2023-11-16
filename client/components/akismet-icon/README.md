# AkismetIcon (TSX)

This component is used to display an Akismet Icon

---

## How to use

```js
import AkismetIcon from 'calypso/components/akismet-icon';

export default function AkismetIconExample() {
    return (
        <div>
            <AkismetIcon className="example-class" size={ 100 } />
        </div>
    )
}
```

## Props

- `className` : (string) Custom classname to be added to the SVG element in addition to the default "akismet-icon" class
- `size`      : (number) The size of the icon (square)
- `color`     : (string) Color of the icon