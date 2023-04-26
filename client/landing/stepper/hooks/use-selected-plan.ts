import { Site } from '@automattic/data-stores';

export function useNewSiteVisibility(): Site.Visibility {
	return Site.Visibility.PublicNotIndexed;
}
