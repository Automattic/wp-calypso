import { bumpStat } from 'calypso/lib/analytics/mc';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export enum CardLocation {
	PRIMARY = 'primary',
	SECONDARY = 'secondary',
	TERTIARY = 'tertiary',
}

type MyHomeCardImpressionProps = {
	card: string;
	location: CardLocation;
};

export default function trackMyHomeCardImpression( {
	card,
	location,
}: MyHomeCardImpressionProps ): void {
	if ( ! card ) {
		return;
	}

	recordTracksEvent( 'calypso_customer_home_card_impression', { card, location } );
	bumpStat( 'customer_home_card_impression', card );
}
