import { useTranslate } from 'i18n-calypso';
import { YearsOfServiceBadge } from 'calypso/reader/components/achievements/years-of-service-badge';
import AchievementCard from './achievement-card';

export default function YearsOfServiceAchievementCard( {
	yearsOfService,
}: {
	yearsOfService: number;
} ) {
	const translate = useTranslate();
	return (
		<AchievementCard
			className="is-years-of-service"
			iconNode={ <YearsOfServiceBadge size="achievement-card" yearsOfService={ yearsOfService } /> }
			title={ translate( 'Years of Service' ) }
			description={ translate(
				'%(years)d year on WordPress.com.',
				'%(years)d years on WordPress.com.',
				{
					count: yearsOfService,
					args: { years: yearsOfService },
				}
			) }
		/>
	);
}
