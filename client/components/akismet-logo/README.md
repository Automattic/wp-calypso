# AkismetLogo (TSX)

This component is used to display an Akismet Logo

---

## How to use

```js
import AkismetLogo from 'calypso/components/akismet-logo';

export default function AkismetLogoExample() {
    return (
        <div>
            <AkismetLogo className="example-class" />
        </div>
    )
}
```

## Props

- `className` : (string) Custom classname to be added to the SVG element in addition to the default "akismet-logo" class
- `size`      : ( object: { height: number, width: number } ) The height and width of the logo
- `color`     : (string) Color of the logo