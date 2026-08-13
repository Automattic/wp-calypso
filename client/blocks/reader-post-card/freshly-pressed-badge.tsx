import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

export const FRESHLY_PRESSED_STREAM_KEY = 'discover:freshly-pressed';

type FreshlyPressedPost = {
	editorial?: {
		displayed_on?: string;
	};
};

export function getFreshlyPressedOn(
	streamKey: string | undefined,
	post: FreshlyPressedPost | null | undefined
): string | undefined {
	if ( streamKey !== FRESHLY_PRESSED_STREAM_KEY ) {
		return undefined;
	}

	const displayedOn = post?.editorial?.displayed_on;
	if ( typeof displayedOn !== 'string' || displayedOn.trim() === '' ) {
		return undefined;
	}

	return displayedOn;
}

export function FreshlyPressedBadge( { displayedOn }: { displayedOn: string } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const date = moment( displayedOn, moment.ISO_8601, true );

	if ( ! date.isValid() ) {
		return null;
	}

	return (
		<span className="reader-post-card__freshly-pressed-badge">
			{ translate( 'Freshly Pressed on %(date)s', {
				args: { date: date.format( 'll' ) },
				comment:
					'Badge on Discover Freshly Pressed cards. %(date)s is a localized calendar date such as Aug 11, 2026.',
			} ) }
		</span>
	);
}
