# Creating a Stepper Step

This guide will walk you through the process of creating a step in the Stepper framework.

## Step-by-Step Guide

### 1. Define the Step Component

Create a new file for your step component. For example, `MyNewStep.tsx`.

```typescript
import React from 'react';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import type { Step } from '../../types';

const MyNewStep: Step<{
  // It is critical to define the types of the data your step will submit. The helps Stepper shape the state of the flow your step is part of.
  submits: { newUserName: string };
  // If your step needs to accept additional props, you can define these props in the `accepts` property. By default, the step get the props defined in the `StepProps` type (see {@link client/landing/stepper/declarative-flow/internals/types.ts}).
  accepts: { userName: string };
}> = ({ navigation, userName }) => {
  const translate = useTranslate();
  const [ newUserName, setNewUserName ] = useState( userName );

  return (
    <StepContainer
      stepName="my-new-step"
      formattedHeader={{
        headerText: translate( `Hi ${ userName }!`),
      }}
      stepContent={
        <div>
          <p>{translate('This is the content of the step.')}</p>
          <input type="text" onChange={(e) => setNewUserName(e.target.value)} />
          <button onClick={() => navigation.submit({ newUserName })}>{translate('Submit')}</button>
        </div>
      }
    />
  );
}

export default MyNewStep;
```

### 2. Register the Step

Add your new step to the `STEPS` object in the `steps.tsx` file.

```typescript
export const STEPS = {
	// ... existing steps
	MY_NEW_STEP: {
		slug: 'my-new-step',
		asyncComponent: () => import( './steps-repository/my-new-step' ),
	},
};
```

### 3. Use the Step in a Flow

Ensure your step is included in a flow. You can add it to an existing flow or create a new one. 

```typescript
const MY_FLOW_STEPS = [
	STEPS.MY_NEW_STEP,
	// ... other steps
];

const myFlow = {
	name: 'myFlow',
	useSteps() {
		return MY_FLOW_STEPS;
	},
	// ... other flow configurations
};
```
