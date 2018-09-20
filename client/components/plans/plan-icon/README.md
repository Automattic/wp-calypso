PlanIcon Component
=============

PlanIcon component is a React component to display plans icons in SVG format. We have four different plans icons:
- Free
- Personal
- Premium
- Business

Jetpack plans also use these plans icons.

## Usage

```jsx
import PlanIcon from 'components/plans/plan-icon';
import { PLAN_FREE, PLAN_BUSINESS } from 'lib/plans/constants';

export default function MyComponent() {
    return (
        <div className="my-component">
            <PlanIcon plan={ PLAN_FREE } />
            <PlanIcon plan={ PLAN_BUSINESS } />
        </div>
    );
}

```

## Props

### plan

Plan constant from `lib/plans/constants`. Can be one of:

- PLAN_FREE,
- PLAN_PREMIUM,
- PLAN_BUSINESS,
- PLAN_JETPACK_FREE,
- PLAN_JETPACK_BUSINESS,
- PLAN_JETPACK_BUSINESS_MONTHLY,
- PLAN_JETPACK_PREMIUM,
- PLAN_JETPACK_PREMIUM_MONTHLY,
- PLAN_PERSONAL

