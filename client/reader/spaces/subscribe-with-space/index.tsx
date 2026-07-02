import { isEnabled } from '@automattic/calypso-config';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, type ComponentProps } from 'react';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SpacePickerModal } from './space-picker-modal';

import './style.scss';

type Props = ComponentProps< typeof ReaderFollowButton >;

/**
 * Subscribe control for the full-post view. When the `reader/spaces` flag is off it
 * renders the plain `ReaderFollowButton`. With the flag on it adds an icon-only
 * button to the left of Subscribe that opens the Space picker (the picker itself
 * subscribes the feed on open).
 */
export function SubscribeWithSpaceButton( props: Props ) {
	const { siteUrl, feedId, siteId, followApiSource } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	if ( ! isEnabled( 'reader/spaces' ) ) {
		return <ReaderFollowButton { ...props } />;
	}

	const openModal = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_subscribe_space_button_clicked', {
				feed_id: feedId,
				blog_id: siteId,
				source: 'full_post_action_bar',
			} )
		);
		setIsModalOpen( true );
	};

	return (
		<>
			<HStack spacing={ 2 } expanded={ false } className="reader-subscribe-with-space">
				<Button
					__next40pxDefaultSize
					className="reader-subscribe-with-space__spaces"
					icon={ category }
					label={ translate( 'Move site to a space' ) }
					onClick={ openModal }
				/>
				<ReaderFollowButton { ...props } />
			</HStack>
			{ isModalOpen && (
				<SpacePickerModal
					feedId={ feedId }
					blogId={ siteId }
					feedUrl={ siteUrl }
					followApiSource={ followApiSource }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
}
