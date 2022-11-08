import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { COURSE_SLUGS } from 'calypso/data/courses';

const { SiteIntent } = Onboard;

const useCourseInfo = ( siteIntent: string ) => {
	const translate = useTranslate();

	switch ( siteIntent ) {
		case SiteIntent.Build: {
			return {
				courseSlug: COURSE_SLUGS.SITE_EDITOR_QUICK_START,
				congratsText: translate(
					"You did it! Now it's time to put your skills to work and customize your homepage."
				),
				skipText: translate( 'Customize your homepage' ),
				actionText: translate( 'Start creating' ),
			};
		}
		default: {
			return {
				courseSlug: COURSE_SLUGS.BLOGGING_QUICK_START,
				congratsText: translate(
					"You did it! Now it's time to put your skills to work and draft your first post."
				),
				skipText: translate( 'Draft your first post' ),
				actionText: translate( 'Start writing' ),
			};
		}
	}
};

export default useCourseInfo;
