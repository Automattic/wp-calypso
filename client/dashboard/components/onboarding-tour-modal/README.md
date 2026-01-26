# Onboarding Tour Modal

A flexible, multi-section modal component designed for onboarding tours and guided experiences. The component displays a series of sections with navigation, banner images, and customizable actions.

## Features

- **Multi-section navigation**: Sidebar menu for desktop navigation between sections
- **Mobile-friendly**: Touch-enabled navigation for mobile devices
- **Customizable actions**: Dynamic action buttons per section
- **Banner images**: Each section can have its own banner image
- **Smooth transitions**: Animated transitions between sections
- **Accessible**: Built with WordPress components for accessibility

## Component Structure

```
OnboardingTourModal
├── Section (OnboardingTourModal.Section)
│   └── SectionContent (OnboardingTourModal.SectionContent)
└── MobileNavigation (internal)
```

## Props

### OnboardingTourModal

| Prop                | Type                          | Required | Description                                                                                                                                    |
| ------------------- | ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `onClose`           | `() => void`                  | Yes      | Callback function called when the modal is closed                                                                                              |
| `onSectionChange`   | `(sectionId: string) => void` | Yes      | Callback function called when the current section changes. The consumer should update `currentSectionId` in response.                          |
| `currentSectionId`  | `string`                      | Yes      | The ID of the currently active section. This state is managed by the consumer.                                                                 |
| `children`          | `ReactNode`                   | No       | Child elements, typically `OnboardingTourModal.Section` components                                                                             |

### OnboardingTourModal.Section

| Prop                | Type                                                           | Required | Description                                                                                          |
| ------------------- | -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `id`                | `string`                                                       | Yes      | Unique identifier for the section                                                                    |
| `title`             | `string`                                                       | Yes      | Title displayed in the sidebar menu                                                                  |
| `bannerImage`       | `string`                                                       | Yes      | URL of the banner image for this section                                                             |
| `isDarkBanner`      | `boolean`                                                      | No       | If true, adjusts the close button styling for dark backgrounds                                       |
| `renderableActions` | `(props: RenderableActionProps) => RenderableAction[]`         | No       | Function that returns an array of action buttons or React elements                                   |
| `children`          | `ReactNode`                                                    | Yes      | Content to display in the section                                                                    |

### OnboardingTourModal.SectionContent

| Prop          | Type         | Required | Description                                    |
| ------------- | ------------ | -------- | ---------------------------------------------- |
| `title`       | `ReactNode`  | Yes      | Main title for the section content             |
| `descriptions`| `ReactNode[]`| No       | Array of description paragraphs                |
| `hint`        | `ReactNode`  | No       | Optional hint text displayed at the bottom     |

## Usage

### Basic Example

```typescript
import OnboardingTourModal from 'calypso/dashboard/components/onboarding-tour-modal';
import { useState } from 'react';

function MyComponent() {
  const [currentSectionId, setCurrentSectionId] = useState('section-1');
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <OnboardingTourModal
      onClose={() => setIsOpen(false)}
      onSectionChange={setCurrentSectionId}
      currentSectionId={currentSectionId}
    >
      <OnboardingTourModal.Section
        id="section-1"
        title="Welcome"
        bannerImage="/path/to/banner1.jpg"
        renderableActions={({ onClose, onNext }) => [
          {
            label: 'Next',
            variant: 'primary',
            onClick: onNext,
          },
          {
            label: 'Skip',
            variant: 'secondary',
            onClick: onClose,
          },
        ]}
      >
        <OnboardingTourModal.SectionContent
          title="Welcome to the Tour"
          descriptions={[
            'This is the first section of the onboarding tour.',
            'You can add multiple description paragraphs.',
          ]}
          hint="Tip: Use the sidebar to navigate between sections"
        />
      </OnboardingTourModal.Section>

      <OnboardingTourModal.Section
        id="section-2"
        title="Getting Started"
        bannerImage="/path/to/banner2.jpg"
        renderableActions={({ onClose }) => [
          {
            label: 'Get Started',
            variant: 'primary',
            onClick: onClose,
          },
        ]}
      >
        <OnboardingTourModal.SectionContent
          title="Let's Get Started"
          descriptions={['This is the second section.']}
        />
      </OnboardingTourModal.Section>
    </OnboardingTourModal>
  );
} 
```

