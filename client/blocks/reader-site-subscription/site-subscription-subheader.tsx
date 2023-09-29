import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { numberFormat, useTranslate } from 'i18n-calypso';
import React from 'react';
import ExternalLink from 'calypso/components/external-link';
import { FeedIcon } from 'calypso/landing/subscriptions/components/settings/icons';
import { getFeedUrl } from 'calypso/reader/route';

type SiteSubscriptionSubheaderProps = {
	feedId: number;
	subscriberCount: number;
	url: string;
};

const getHostname = ( url: string ) => {
	try {
		return new URL( url ).hostname;
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
					args: [ numberFormat( subscriberCount, 0 ) ],
					comment: '%s is the number of subscribers. For example: "12,000,000"',
				} ) }
			</div>
		);
	}

	const hostname = getHostname( url );
	if ( hostname !== '' ) {
		subheaderItems.push(
			<ExternalLink key={ url } href={ url } rel="noreferrer noopener" target="_blank">
				{ hostname }
			</ExternalLink>
		);
	}

	subheaderItems.push(
		<Button
			key={ `view-feed-button-${ feedId }` }
			title={ translate( 'View feed' ) }
			className="site-subscription-header__view-feed-button"
			icon={ <FeedIcon /> }
			href={ getFeedUrl( feedId ) }
		/>
	);

	return (
		<HStack className="site-subscription-header">{ withDotSeparators( subheaderItems ) }</HStack>
	);
};

export default React.memo( SiteSubscriptionSubheader );
