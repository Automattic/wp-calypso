ProductIcon Component
=============

ProductIcon component is a React component to display plan or product icon in SVG format.

## Usage

```jsx
import ProductIcon from '@automattic/components/product-icon';

export default function MyComponent() {
    return (
        <div className="my-component">
            <ProductIcon slug="free" />
            <ProductIcon slug="jetpack-professional" />
            <ProductIcon slug="jetpack-backup-daily" />
        </div>
    );
}

```

## Props

### `slug`

Plan or product slug. Can be one of the following:

- `free`
- `blogger`
- `personal`
- `premium`
- `business`
- `ecommerce`
- `jetpack-free`
- `jetpack-personal`
- `jetpack-premium`
- `jetpack-professional`
- `jetpack-backup-daily`
- `jetpack-backup-realtime`

### `className`

Additional class name to be added to the icon element.

