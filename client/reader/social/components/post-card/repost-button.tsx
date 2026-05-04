import { formatNumber } from '@automattic/number-formatters';
import { Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderRepostIcon from 'calypso/reader/components/icons/repost';
import { useRepostAction } from './repost-context';
import type { SocialPost } from '../../types';

import './repost-button.scss';

interface RepostButtonProps {
	post: SocialPost;
}

export function RepostButton( { post }: RepostButtonProps ) {
	const translate = useTranslate();
	const action = useRepostAction( post );

	if ( ! action.supported ) {
		return null;
	}

	const { isReposted, isPending } = action;
	const formattedReposts = formatNumber( post.counts.reposts );
	const accessibleLabel = String( action.label.accessibleLabel( post.counts.reposts, isReposted ) );

	if ( isReposted ) {
		return (
			<button
				type="button"
				className={ clsx( 'social-post-card-repost-button', {
					'is-reposted': true,
					'is-pending': isPending,
				} ) }
				aria-pressed
				aria-label={ accessibleLabel }
				disabled={ isPending }
				onClick={ ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					if ( isPending ) {
						return;
					}
					action.unrepost();
				} }
			>
				<ReaderRepostIcon iconSize={ 16 } />
				<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
			</button>
		);
	}

	return (
		<Dropdown
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button
					type="button"
					className={ clsx( 'social-post-card-repost-button', { 'is-pending': isPending } ) }
					aria-haspopup="menu"
					aria-expanded={ isOpen }
					aria-label={ accessibleLabel }
					disabled={ isPending }
					onClick={ ( event ) => {
						event.preventDefault();
						event.stopPropagation();
						if ( isPending ) {
							return;
						}
						onToggle();
					} }
				>
					<ReaderRepostIcon iconSize={ 16 } />
					<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
				</button>
			) }
			renderContent={ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						onClick={ () => {
							onClose();
							action.repost();
						} }
					>
						{ action.label.action }
					</MenuItem>
					<MenuItem
						disabled={ ! action.canQuote }
						onClick={ () => {
							if ( ! action.canQuote ) {
								return;
							}
							onClose();
							action.quote();
						} }
					>
						{ translate( 'Quote post' ) }
					</MenuItem>
				</MenuGroup>
			) }
		/>
	);
}
