export const TIMELINE_TAB = 'timeline' as const;
export const PROFILE_TAB = 'profile' as const;
export const SETTINGS_TAB = 'settings' as const;

export type FediverseTab = typeof TIMELINE_TAB | typeof PROFILE_TAB | typeof SETTINGS_TAB;
