import { HelpCenter } from '@automattic/data-stores';
import './style.scss';

export const HELP_CENTER_STORE = HelpCenter.register();
export {
	useWhatsNewAnnouncementsQuery,
	type WhatsNewAnnouncement,
} from './hooks/use-whats-new-announcements-query';
export { useShouldShowCriticalAnnouncementsQuery } from './hooks/use-should-show-critical-announcements-query';
export { default } from './guide';
