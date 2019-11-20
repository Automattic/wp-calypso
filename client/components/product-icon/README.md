ProductIcon Component
=============

ProductIcon component is a React component to display plans or products icons in SVG format.

We have four different plans icons:
- Free
- Personal
- Premium
- Business

Jetpack plans also use these plans icons.

There is also one product icon:
- Jetpack Backup

## Usage

```jsx
import ProductIcon from 'components/product-icon';
import { PLAN_FREE, PLAN_BUSINESS } from 'lib/plans/constants';
import { PRODUCT_JETPACK_BACKUP_DAILY } from 'lib/products-values/constants';

export default function MyComponent() {
    return (
        <div className="my-component">
            <ProductIcon product={ PLAN_FREE } />
            <ProductIcon product={ PLAN_BUSINESS } />
            <ProductIcon product={ PRODUCT_JETPACK_BACKUP_DAILY } />
        </div>
    );
}

```

## Props

### `product`

Plan constant from `lib/plans/constants` or product constant from `lib/products-values/constants`. Can be one of:

- PLAN_FREE,
- PLAN_PREMIUM,
- PLAN_BUSINESS,
- PLAN_JETPACK_FREE,
- PLAN_JETPACK_BUSINESS,
- PLAN_JETPACK_BUSINESS_MONTHLY,
- PLAN_JETPACK_PREMIUM,
- PLAN_JETPACK_PREMIUM_MONTHLY,
- PLAN_PERSONAL,
- PRODUCT_JETPACK_BACKUP_DAILY,
- PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
- PRODUCT_JETPACK_BACKUP_REALTIME,
- PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY

### `className`

Additional class name to be added to the icon element.

