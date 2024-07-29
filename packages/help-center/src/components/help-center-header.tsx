import { CardHeader, Button, Flex } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { closeSmall, chevronUp, lineSolid, commentContent, page, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { usePostByKey } from '../hooks/use-post-by-key';
import { useSupportArticleAlternatePostKey } from '../hooks/use-support-article-alternates-query';
import { DragIcon } from '../icons';
import { HELP_CENTER_STORE } from '../stores';
import type { Header } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';

export function ArticleTitle() {
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const postId = params.get( 'postId' );
	const blogId = params.get( 'blogId' ) ?? undefined;

	const postKey = useSupportArticleAlternatePostKey( blogId, +( postId || 0 ) );
	const post = usePostByKey( postKey ).data;

	return (
		<>
			<Icon icon={ page } />
			<span className="help-center-header__article-title">{ post?.title }</span>
		</>
	);
}

const SupportModeTitle = () => {
	const { __ } = useI18n();
	const { search } = useLocation();
	const params = new URLSearchParams( search );

	const mode = params.get( 'mode' );
	switch ( mode ) {
		case 'CHAT':
			return (
				<>
					<Icon icon={ commentContent } />
					{ __( 'Contact WordPress.com Support', __i18n_text_domain__ ) }
				</>
			);
		case 'EMAIL': {
			return <>{ __( 'Send us an email', __i18n_text_domain__ ) }</>;
		}
		case 'FORUM': {
			return <>{ __( 'Ask in our community forums', __i18n_text_domain__ ) }</>;
		}
		default: {
			return <>{ __( 'Help Center', __i18n_text_domain__ ) }</>;
		}
	}
};

const Content = ( { onMinimize }: { onMinimize?: () => void } ) => {
	const { __ } = useI18n();

	return (
		<>
			<DragIcon />
			<p id="header-text" className="help-center-header__text" role="presentation">
				{ __( 'Help Center', __i18n_text_domain__ ) }
			</p>
			<Button
				className="help-center-header__minimize"
				label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
				icon={ lineSolid }
				tooltipPosition="top left"
				onClick={ () => onMinimize?.() }
				onTouchStart={ () => onMinimize?.() }
			/>
		</>
	);
};

const ContentMinimized = ( {
	handleClick,
	onMaximize,
}: {
	handleClick?: ( event: React.SyntheticEvent ) => void;
	onMaximize?: () => void;
} ) => {
	const { __ } = useI18n();
	const unreadCount = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
		[]
	);
	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;

	return (
		<>
			<p
				id="header-text"
				className="help-center-header__text"
				onClick={ handleClick }
				onKeyUp={ handleClick }
				role="presentation"
			>
				<Routes>
					<Route path="/" element={ __( 'Help Center', __i18n_text_domain__ ) } />
					<Route
						path="/contact-options"
						element={ __( 'Contact Options', __i18n_text_domain__ ) }
					/>
					<Route path="/inline-chat" element={ __( 'Live Chat', __i18n_text_domain__ ) } />
					<Route path="/contact-form" element={ <SupportModeTitle /> } />
					<Route path="/post" element={ <ArticleTitle /> } />
					<Route path="/success" element={ __( 'Message Submitted', __i18n_text_domain__ ) } />
					<Route path="/odie" element={ __( 'Wapuu', __i18n_text_domain__ ) } />
				</Routes>
				{ unreadCount > 0 && (
					<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
				) }
			</p>
			<Button
				className="help-center-header__maximize"
				label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
				icon={ chevronUp }
				tooltipPosition="top left"
				onClick={ onMaximize }
				onTouchStart={ onMaximize }
			/>
		</>
	);
};

const HelpCenterHeader = ( { isMinimized = false, onMinimize, onMaximize, onDismiss }: Header ) => {
	const { __ } = useI18n();

	const handleClick = useCallback(
		( event: React.SyntheticEvent ) => {
			if ( event.target === event.currentTarget ) {
				onMaximize?.();
			}
		},
		[ onMaximize ]
	);

	return (
		<CardHeader className="help-center__container-header">
			<Flex onClick={ handleClick }>
				{ isMinimized ? (
					<ContentMinimized handleClick={ handleClick } onMaximize={ onMaximize } />
				) : (
					<Content onMinimize={ onMinimize } />
				) }
				<Button
					className="help-center-header__close"
					label={ __( 'Close Help Center', __i18n_text_domain__ ) }
					tooltipPosition="top left"
					icon={ closeSmall }
					onClick={ onDismiss }
					onTouchStart={ onDismiss }
				/>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterHeader;
