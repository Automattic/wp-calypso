import { isEnabled } from '@automattic/calypso-config';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type ComponentProps } from 'react';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useShelfPicker } from './use-shelf-picker';

import './style.scss';

type Props = ComponentProps< typeof ReaderFollowButton >;

/**
 * Subscribe control for the full-post view. When the `reader/shelves` flag is off it
 * renders the plain `ReaderFollowButton`. With the flag on it adds an icon-only
 * button to the left of Subscribe that opens the Shelf picker (the picker itself
 * subscribes the feed on open).
 */
export function SubscribeWithShelfButton( props: Props ) {
	const { siteUrl, feedId, siteId, followApiSource } = props;
	const translate = useTranslate();
	const { openShelfPicker, shelfPickerModal } = useShelfPicker( {
		feedId,
		blogId: siteId,
		feedUrl: siteUrl,
		followApiSource,
		source: 'full_post_action_bar',
	} );

	if ( ! isEnabled( 'reader/shelves' ) ) {
		return <ReaderFollowButton { ...props } />;
	}

	return (
		<>
			<HStack spacing={ 2 } expanded={ false } className="reader-subscribe-with-shelf">
				<Button
					__next40pxDefaultSize
					className="reader-subscribe-with-shelf__shelves"
					icon={ category }
					label={ translate( 'Move site to a shelf' ) }
					onClick={ openShelfPicker }
				/>
				<ReaderFollowButton { ...props } />
			</HStack>
			{ shelfPickerModal }
		</>
	);
}
