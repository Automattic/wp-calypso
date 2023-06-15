# ConfirmModal Component

The ConfirmModal component is a reusable component that provides a confirmation dialog with customizable buttons and text.

## Usage

Import the ConfirmModal component in your project:

```jsx
import ConfirmModal from './ConfirmModal';
```

The ConfirmModal component accepts the following props:

- `isVisible`: Whether the modal is visible or not.
- `cancelButtonLabel` (optional): Label or content for the cancel button.
- `confirmButtonLabel` (optional): Label or content for the confirm button.
- `text` (optional): Additional text to display in the modal.
- `title`: Title of the confirmation modal.
- `onCancel`: Callback function to handle the cancel button click event.
- `onConfirm`: Callback function to handle the confirm button click event.

## Example usage

```jsx
<ConfirmModal
  isVisible={isVisible}
  cancelButtonLabel="Cancel"
  confirmButtonLabel="Confirm"
  text="Are you sure you want to proceed?"
  title="Confirmation"
  onCancel={handleCancel}
  onConfirm={handleConfirm}
/>
```

Make sure to define the `handleCancel` and `handleConfirm` functions in your code to handle the respective button click events.
