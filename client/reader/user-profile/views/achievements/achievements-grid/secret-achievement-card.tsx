import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AchievementCard from './achievement-card';

interface SecretAchievementCardProps {
	/** Render the locked variant — faded card. Omit for unlocked masked secrets. */
	locked?: boolean;
	/** Profile owner's unlock date. Present only for masked secrets in the earned list. */
	unlockedDate?: string;
}

export default function SecretAchievementCard( {
	locked,
	unlockedDate,
}: SecretAchievementCardProps ) {
	const translate = useTranslate();
	const title = translate( 'Secret achievement' );
	const description = translate( 'This one’s a mystery. Earn it to reveal the details.' );
	const caption = unlockedDate
		? translate( 'Unlocked: {{timeSince/}}', {
				components: { timeSince: <TimeSince date={ unlockedDate } /> },
		  } )
		: undefined;

	return (
		<AchievementCard
			locked={ locked }
			secret
			title={ title }
			description={ description }
			caption={ caption }
		/>
	);
}
