ProductIcon Component
=============

ProductIcon component is a React component to display plan or product icons in SVG format.

We have the following different plans icons:
- Free
- Personal
- Premium
- Business (Professional)
- Ecommerce

Jetpack plans also use these plans icons.

There are also the following product icons:
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
- PLAN_BUSINESS,
- PLAN_BUSINESS_2_YEARS,
- PLAN_PREMIUM,
- PLAN_PREMIUM_2_YEARS,
- PLAN_PERSONAL,
- PLAN_PERSONAL_2_YEARS,
- PLAN_ECOMMERCE,
- PLAN_ECOMMERCE_2_YEARS,
- PLAN_JETPACK_FREE,
- PLAN_JETPACK_PERSONAL,
- PLAN_JETPACK_PERSONAL_MONTHLY,
- PLAN_JETPACK_PREMIUM,
- PLAN_JETPACK_PREMIUM_MONTHLY,
- PLAN_JETPACK_BUSINESS,
- PLAN_JETPACK_BUSINESS_MONTHLY,
- PRODUCT_JETPACK_BACKUP_DAILY,
- PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
- PRODUCT_JETPACK_BACKUP_REALTIME,
- PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY

### `className`

Additional class name to be added to the icon element.

