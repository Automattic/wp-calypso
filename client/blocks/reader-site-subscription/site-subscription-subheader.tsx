import { localizeUrl } from '@automattic/i18n-utils';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { numberFormat, useTranslate } from 'i18n-calypso';
import React from 'react';
import ExternalLink from 'calypso/components/external-link';
import { useRecordViewFeedButtonClicked } from 'calypso/landing/subscriptions/tracks';
import { getFeedUrl } from 'calypso/reader/route';

type SiteSubscriptionSubheaderProps = {
	blogId: number;
	feedId: number;
	subscriberCount: number;
	url: string;
};

const getHostname = ( url: string ) => {
	try {
		return new URL( localizeUrl( url ) ).hostname;
	} catch ( e ) {
		return '';
	}
};

const withDotSeparators = ( items: React.ReactNode[] ) => {
	const itemsWithSeparator: React.ReactNode[] = [];
	items.forEach( ( item, index ) => {
		itemsWithSeparator.push( item );
		if ( index !== items.length - 1 ) {
			itemsWithSeparator.push( <div key={ `dot-separator-${ index }` }>·</div> );
		}
	} );
	return itemsWithSeparator;
};

const SiteSubscriptionSubheader = ( {
	blogId,
	feedId,
	subscriberCount,
	url,
}: SiteSubscriptionSubheaderProps ) => {
	const translate = useTranslate();

	const subheaderItems = [];

	if ( subscriberCount > 0 ) {
		subheaderItems.push(
			<div key={ `subscriber-count-${ subscriberCount }` }>
				{ translate( '%s subscriber', '%s subscribers', {
					count: subscriberCount,
					args: [ numberFormat( subscriberCount ) ],
					comment: '%s is the number of subscribers. For example: "12,000,000"',
				} ) }
			</div>
		);
	}

	const hostname = getHostname( url );
	if ( hostname !== '' ) {
		subheaderItems.push(
			<ExternalLink key={ url } href={ url } target="_blank">
				{ hostname }
			</ExternalLink>
		);
	}

	const recordViewFeedButtonClicked = useRecordViewFeedButtonClicked();

	subheaderItems.push(
		<a
			href={ getFeedUrl( feedId ) }
			onClick={ () => {
				recordViewFeedButtonClicked( {
					blogId: blogId ? String( blogId ) : null,
					feedId: String( feedId ),
					source: 'subscription-feed-link',
				} );
			} }
		>
			{ translate( 'Reader' ) }
		</a>
	);

	return (
		<HStack className="site-subscription-header" alignment="center" spacing={ 1 }>
			{ withDotSeparators( subheaderItems ) }
		</HStack>
	);
};

export default React.memo( SiteSubscriptionSubheader );
