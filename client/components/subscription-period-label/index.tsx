import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';

type SubscriptionPeriodLabelProps = {
	endDate?: string | null;
	isComp?: boolean;
	isFree?: boolean;
};

const SubscriptionPeriodLabel = ( { endDate, isComp, isFree }: SubscriptionPeriodLabelProps ) => {
	const translate = useTranslate();
	const localeSlug = useLocale();

	if ( isFree && ! isComp ) {
		return translate( 'N/A', {
			context: 'For free subscriptions the period description is displayed as N/A (not applicable)',
		} );
	}

	if ( endDate ) {
		const date = moment( endDate ).locale( localeSlug );
		const formatted = date.format( 'LL' );
		if ( isComp ) {
			return date.isBefore( moment() )
				? translate( 'Expired' )
				: translate( 'Expires on %s', { args: [ formatted ] } );
		}
		return translate( 'Renews on %s', { args: [ formatted ] } );
	}

	if ( isComp ) {
		return translate( "Doesn't expire" );
	}

	return translate( 'Auto-renews' );
};

export default SubscriptionPeriodLabel;
