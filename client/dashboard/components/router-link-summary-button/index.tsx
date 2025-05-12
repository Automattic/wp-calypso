import SummaryButton from '@automattic/components/src/summary-button';
import { createLink } from '@tanstack/react-router';

/**
 * This component is a wrapper of `SummaryButton` component and acts as a
 * navigational element. It uses `createLink` from `@tanstack/react-router` to create a
 * link that can be used to navigate to a different route when the button is clicked.
 * It's separate from `SummaryButton` to allow for better separation of concerns, as
 * `SummaryButton` is a pure UI component.
 */
export default createLink( SummaryButton );
