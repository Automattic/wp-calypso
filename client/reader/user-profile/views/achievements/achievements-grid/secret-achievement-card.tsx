import { TimeSince } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
	const descriptions = [
		translate( 'This one’s a mystery. Earn it to reveal the details.' ),
		translate( 'A secret achievement. Unlock it to see what’s inside.' ),
		translate( 'Top secret. Earn it to read the briefing.' ),
		translate( 'Shhh… this one’s a surprise. Unlock it to take a peek.' ),
		translate( 'Classified for now. Earn it to see the file.' ),
		translate( 'Some achievements prefer to stay hidden. Coax this one out.' ),
		translate( 'No spoilers — earn it to find out what this one’s about.' ),
		translate( 'A puzzle wrapped in a mystery. Earn it to uncover the answer.' ),
		translate( 'Mystery achievement. Keep going — it’ll reveal itself.' ),
		translate( 'Hidden in plain sight. Keep at it to unlock the details.' ),
	];
	const [ descriptionIndex ] = useState( () => Math.floor( Math.random() * descriptions.length ) );
	const description = descriptions[ descriptionIndex ];
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
