import { formatNumber } from '@automattic/number-formatters';
import { Dropdown, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderRepostIcon from 'calypso/reader/components/icons/repost';
import { useRepostAction } from './repost-context';
import type { SocialPost } from '../../types';

import './repost-button.scss';

interface RepostButtonProps {
	post: SocialPost;
	hideCount?: boolean;
}

const ICON_SIZE = 18;

export function RepostButton( { post, hideCount }: RepostButtonProps ) {
	const translate = useTranslate();
	const action = useRepostAction( post );
	const totalReposts = post.counts.reposts + post.counts.quotes;
	const formattedReposts = formatNumber( totalReposts );

	// No <RepostProvider> mounted (or the adapter declined to support the
	// post) — render a static count so the cell isn't empty. Mirrors the
	// non-interactive markup `<PostCardCounts>` used to inline before the
	// adapter pattern took over the gate.
	if ( ! action.supported ) {
		return (
			<span className="social-post-card-repost-button social-post-card-repost-button--static">
				<ReaderRepostIcon iconSize={ ICON_SIZE } />
				{ ! hideCount && (
					<>
						<span className="screen-reader-text">{ translate( 'Reposts:' ) } </span>
						<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
					</>
				) }
			</span>
		);
	}

	const { isReposted, isPending } = action;
	const accessibleLabel = String( action.label.accessibleLabel( totalReposts, isReposted ) );

	if ( isReposted ) {
		return (
			<Tooltip text={ accessibleLabel }>
				<button
					type="button"
					className={ clsx( 'social-post-card-repost-button', {
						'is-reposted': true,
						'is-pending': isPending,
					} ) }
					aria-pressed
					aria-label={ accessibleLabel }
					aria-disabled={ isPending || undefined }
					onClick={ ( event ) => {
						event.preventDefault();
						event.stopPropagation();
						if ( isPending ) {
							return;
						}
						action.unrepost();
					} }
				>
					<ReaderRepostIcon iconSize={ ICON_SIZE } />
					{ ! hideCount && (
						<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
					) }
				</button>
			</Tooltip>
		);
	}

	return (
		<Dropdown
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Tooltip text={ accessibleLabel }>
					<button
						type="button"
						className={ clsx( 'social-post-card-repost-button', { 'is-pending': isPending } ) }
						aria-haspopup="menu"
						aria-expanded={ isOpen }
						aria-label={ accessibleLabel }
						aria-disabled={ isPending || undefined }
						onClick={ ( event ) => {
							event.preventDefault();
							event.stopPropagation();
							if ( isPending ) {
								return;
							}
							onToggle();
						} }
					>
						<ReaderRepostIcon iconSize={ ICON_SIZE } />
						{ ! hideCount && (
							<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
						) }
					</button>
				</Tooltip>
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
