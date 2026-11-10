import { createLink } from '@tanstack/react-router';
import DashboardSummaryButton from '../summary-button';

/**
 * This component wraps `DashboardSummaryButton` (which itself wraps `SummaryButton`)
 * and transforms it into a navigational element using `createLink` from `@tanstack/react-router`.
 * When the button is clicked, it navigates to a different route instead of performing
 * a standard action. This separation allows `SummaryButton` to remain a pure UI component
 * while providing routing functionality when needed.
 */
export default createLink( DashboardSummaryButton );
