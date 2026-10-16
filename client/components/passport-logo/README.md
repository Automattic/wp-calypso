# PassportLogo (TSX)

This component is used to display an Passport Logo

---

## How to use

```js
import PassportLogo from 'calypso/components/passport-logo';

export default function PassportLogoExample() {
    return (
        <div>
            <PassportLogo className="example-class" />
        </div>
    )
}
```

## Props

- `className` : (string) Custom classname to be added to the SVG element in addition to the default "passport-logo" class
- `size` : ( object: { height: number, width: number } ) The height and width of the logo
- `color` : (string) Color of the logo
