import { createContext } from 'react';

/**
 * True while the pricing grid gate keeps the dashboard mounted out of sight, so page views
 * wait until a visitor can actually see it.
 */
const DashboardHiddenContext = createContext( false );

export default DashboardHiddenContext;
