import type { User as UserStore } from '@automattic/data-stores';

export interface HelpCenterAppProps {
	user: UserStore.CurrentUser;
}
