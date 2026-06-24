import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { check, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { memo, useCallback } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import type { SiteSubscriptionItem } from '@automattic/api-core';

interface Props {
	subscription: SiteSubscriptionItem;
	isAdded: boolean;
	onAdd: ( subscription: SiteSubscriptionItem ) => void;
	onRemove: ( subscription: SiteSubscriptionItem ) => void;
}

function getSubscriptionName( subscription: SiteSubscriptionItem ): string {
	const url = subscription.URL || subscription.feed_URL;
	return subscription.name || formatUrlForDisplay( url ) || url;
}

function getSubscriptionUrl( subscription: SiteSubscriptionItem ): string {
	const url = subscription.URL || subscription.feed_URL;
	return formatUrlForDisplay( url ) || url;
}

export const SourceSubscription = memo( function SourceSubscription( {
	subscription,
	isAdded,
	onAdd,
	onRemove,
}: Props ) {
	const translate = useTranslate();
	const name = getSubscriptionName( subscription );
	const url = getSubscriptionUrl( subscription );
	const handleToggle = useCallback( () => {
		if ( isAdded ) {
			onRemove( subscription );
			return;
		}

		onAdd( subscription );
	}, [ isAdded, onAdd, onRemove, subscription ] );

	return (
		<HStack
			spacing={ 3 }
			alignment="center"
			justify="space-between"
			className="space-sources__row"
			role="listitem"
			aria-label={ name }
			style={ { minHeight: 56 } }
		>
			<HStack
				spacing={ 3 }
				alignment="center"
				justify="flex-start"
				className="space-sources__row-main"
			>
				{ /* Decorative: the row is already labeled by the site name (aria-label above). */ }
				<SiteIcon iconUrl={ subscription.site_icon } size={ 40 } alt="" />
				<VStack spacing={ 0 } className="space-sources__row-content">
					<div className="space-sources__row-name">{ name }</div>
					<div className="space-sources__row-url">{ url }</div>
				</VStack>
			</HStack>
			<Button
				__next40pxDefaultSize
				variant={ isAdded ? 'secondary' : 'primary' }
				icon={ isAdded ? check : plus }
				aria-label={
					isAdded
						? ( translate( 'Remove %(name)s', { args: { name } } ) as string )
						: ( translate( 'Add %(name)s', { args: { name } } ) as string )
				}
				onClick={ handleToggle }
			/>
		</HStack>
	);
} );
