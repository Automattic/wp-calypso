# StepContainerV2

Next-generation step composition utility.

**Disclaimer: This is a work in progress and the API is not yet stable.**

## Why

This is a compilation of everything we've learned with `StepContainer`. Just like its predecessor, it focuses on aesthetics of the step (standardized components, margins, paddings, etc.), and not their content or functionality. The main difference is that it's more flexible and easier to extend.

The new version focuses on modularity and composition instead of overrides through props and CSS. We've observed that the previous version accepted a variety of props that modified how a component looks. Most of the times these properties had to play nicely with each other, which increased complexity.

This version, however, provides several "slots" that allow the developer to declare _which_ parts of the step will be rendered through the creation of wireframes, instead of imperatively specifying _what_ to render. `topBar`, `heading`, `stickyBottomBar`, and `footer` are example of slots.

It also provides the elements to be used within these slots, such as `TopBar`, `Heading`, `StickyBottomBar`, and `Footer`, as well as their internal elements, such as buttons like `PrimaryButton`, `SkipButton`, and `BackButton`.

Here's an example:

```jsx
import { Step } from '@automattic/onboarding';

const MyStep = () => {
	const nextButton = <Step.PrimaryButton onClick={ navigation.submit } />;

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 4 }
			topBar={ <Step.TopBar /> }
			heading={ <Step.Heading text="Heading" /> }
			stickyBottomBar={ <Step.StickyBottomBar rightElement={ nextButton } /> }
		>
			{ ( { isSmallViewport } ) => (
				<>
					<p>Here comes the content of the step.</p>
					{ isSmallViewport && nextButton }
				</>
			) }
		</Step.CenteredColumnLayout>
	);
};
```

In the example above, the top bar won't have a skip nor a back button. There's a `stickyBottomBar` that will render the Next button on mobile, and the same button will also be rendered within the step's content, but only on smaller screens and above. Although it's possible, this particular step won't render a footer.

It reduces the complexity of layouting by delegating the rendering responsibility to the components within the slots. A good example of what we mean here is the [`headerImageUrl` prop of `StepContainer`](../step-container/index.tsx), which should exist if `isHorizontalLayout` is `true`, but there is no explanation of that in the code, and it's not obvious to the developer reading code introduced by others.

Read the [how to extend it](#how-to-extend-it) section to learn how to reproduce this behavior in `StepContainerV2`.

## How to use it

**You shouldn't use `StepContainerV2` directly. Instead, use the wireframes that are exported from this package.**

Aside from the stories (run `yarn storybook`), you can follow the examples from `~/client/landing/stepper/declarative-flow/internals/steps-repository`.

Please do NOT override the `Step.*` components with CSS as this creates inconsistencies between steps and becomes a maintenance nightmare. Ideally, you should not need to do this as the steps are designed to be composed, and the wireframes are approved by the designers.

### What are wireframes?

Wireframes are layout arrangements that have been approved by the Dotcom designers. They are exported from this package and can be used in the steps.

Here are the wireframes specs: <https://www.figma.com/design/QFAYPvq4xYUZC5AFkrfJFM/Dotcom-Onboarding-(Open)?node-id=1-31&p=f&t=CX7AmXyb9CTsFGAI-0>.

## How to extend it

- Try to keep the components as generic as possible, and without adding overrides to components coming from `@wordpress/components` unless explicitly approved by the designers.
- If the step has a unique UI element that does not exist in other steps, it probably does not belong in `StepContainerV2`. Try using some of the slots, or add a new one.
- Do not add `is*` props to `StepContainerV2` as we want to stick to composition.
- Do not export `StepContainerV2` directly. We're defining several wireframes that were approved by the designers, and these are the components you should be using in the steps.

### Workshop: How to create the horizontal layout wireframe

As a way to demonstrate how to create a new wireframe, let's re-create `HorizontalLayout`.

This layout arranges two columns side by side. It has the heading on the left and the content on the right. Optionally, an image is rendered below the heading. One example of where this layout is used is in `/setup/site-setup/intent?siteSlug=%s`.

Let's create a new wireframe named `HorizontalLayout`. Here's what its code looks like:

```tsx
interface HorizontalLayoutProps {
	topBar?: ContentProp;
	heading?: ReactNode;
	imageUrl?: string;
	className?: string;
	children?: ContentProp;
	footer?: ReactNode;
	stickyBottomBar?: ContentProp;
}

export const HorizontalLayout = ( {
	topBar,
	heading,
	imageUrl,
	children,
	footer,
	stickyBottomBar,
}: HorizontalLayoutProps ) => {
	return (
		<StepContainerV2>
			{ ( context ) => {
				const content = typeof children === 'function' ? children( context ) : children;

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<ContentWrapper width="wide" centerAligned={ context.isSmallViewport }>
							<Content className="step-container-v2__content--horizontal-layout">
								<div className="step-container-v2__content--horizontal-layout-left">
									{ heading }
									{ imageUrl && <img src={ imageUrl } alt="" /> }
								</div>
								<div className="step-container-v2__content--horizontal-layout-right">
									{ content }
								</div>
							</Content>
							{ footer }
						</ContentWrapper>
						<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
					</>
				);
			} }
		</StepContainerV2>
	);
};
```

Then, we need to add the styles for the new wireframe. Let's create a new file called `style.scss` and add the following code:

```scss
.step-container-v2__content--horizontal-layout {
	display: flex;
	flex-direction: column;
	gap: 3rem;

	@include break-large {
		flex-direction: row;
	}
}

.step-container-v2__content--horizontal-layout-left,
.step-container-v2__content--horizontal-layout-right {
	flex: 1;
}

.step-container-v2__content--horizontal-layout-left {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 3rem;
}
```

> Notice that we're using the `@include break-large` mixin to target the large viewport and above. The Gutenberg breakpoints are matched within StepContainerV2, so we can use them to create responsive styles for the wireframe.

One implementation detail is that the `HorizontalLayout` wireframe does not render the illustration on mobile. `StepContainerV2` accepts a render prop that can be used to render the content of the step. This is useful to conditionally render content based on the viewports defined for the wireframe. We can then modify the previous example to render the illustration only on medium and larger screens.

Let's modify the `children` of `HorizontalLayout` to reflect this new requirement:

```jsx
( context ) => {
	const content = typeof children === 'function' ? children( context ) : children;

	return (
		<>
			<TopBarRenderer topBar={ topBar } />
			<ContentWrapper width="wide" centerAligned={ context.isSmallViewport }>
				<Content className="step-container-v2__content--horizontal-layout">
					<div className="step-container-v2__content--horizontal-layout-left">
						{ heading }
						{ context.isSmallViewport && imageUrl && <img src={ imageUrl } alt="" /> }
					</div>
					<div className="step-container-v2__content--horizontal-layout-right">{ content }</div>
				</Content>
				{ footer }
			</ContentWrapper>
			<StickyBottomBarRenderer stickyBottomBar={ stickyBottomBar } />
		</>
	);
};
```

The horizontal layout wireframe expects the heading element to be left-aligned. We can create a new compound component and expose that as part of the public API of the wireframe:

```tsx
HorizontalLayout.Heading = ( props: ComponentProps< typeof Heading > ) => (
	<Heading { ...props } align="left" />
);
```

Last but not least, let's export the wireframe so it can be used in a step:

```tsx
// In step-container-v2/index.ts
// ...
export { HorizontalLayout } from './wireframes/HorizontalLayout/HorizontalLayout';
```

Et voilà, we've created a new wireframe. Here's how to use it:

```jsx
<Step.HorizontalLayout
	heading={ <Step.HorizontalLayout.Heading text="Heading" /> }
	imageUrl={ imageUrl }
>
	<p>Here comes the content rendered in the right column of the step.</p>
	<Step.PrimaryButton onClick={ navigation.submit } />
</Step.HorizontalLayout>
```

This feels a bit more verbose, but it's fine since we won't be creating wireframes every day. Remember that a wireframe is the shell of a step, which is designed to be reusable. This longer process ensures that the wireframe is well-thought-out.

## FAQ

### Will this component be called `StepContainerV2` forever?

Of course not! The plan is for this new version to replace `StepContainer` entirely. We'll do this migration gradually.

### How can I adopt it in Stepper without breaking steps that are used in multiple flows?

There's an utility called `shouldUseStepContainerV2` that allows, at a step level, to define which flows should render this version of the container vs. the original one.

### Who can I contact if I have any questions?

Ping @quake-team on Slack.
