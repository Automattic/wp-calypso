import { CardHeader, Button, Flex } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { closeSmall, chevronUp, lineSolid, commentContent, page, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { HELP_CENTER_STORE } from '../stores';
import type { Header } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';

export function ArticleTitle() {
	const location = useLocation();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const title = location.state?.title || params.get( 'title' ) || '';

	return (
		<>
			<Icon icon={ page } />
			<span className="help-center-header__article-title">{ title }</span>
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

const HelpCenterHeader = ( { isMinimized = false, onMinimize, onMaximize, onDismiss }: Header ) => {
	const unreadCount = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
		[]
	);
	const classNames = clsx( 'help-center__container-header' );
	const { __ } = useI18n();
	const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount;

	const handleClick = useCallback(
		( event: React.SyntheticEvent ) => {
			if ( isMinimized && event.target === event.currentTarget ) {
				onMaximize?.();
			}
		},
		[ isMinimized, onMaximize ]
	);

	return (
		<CardHeader className={ classNames }>
			<Flex onClick={ handleClick }>
				<p
					id="header-text"
					className="help-center-header__text"
					onClick={ handleClick }
					onKeyUp={ handleClick }
					role="presentation"
				>
					{ isMinimized ? (
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
					) : (
						__( 'Help Center', __i18n_text_domain__ )
					) }
					{ isMinimized && unreadCount > 0 && (
						<span className="help-center-header__unread-count">{ formattedUnreadCount }</span>
					) }
				</p>
				<div>
					{ isMinimized ? (
						<Button
							className="help-center-header__maximize"
							label={ __( 'Maximize Help Center', __i18n_text_domain__ ) }
							icon={ chevronUp }
							tooltipPosition="top left"
							onClick={ onMaximize }
							onTouchStart={ onMaximize }
						/>
					) : (
						<Button
							className="help-center-header__minimize"
							label={ __( 'Minimize Help Center', __i18n_text_domain__ ) }
							icon={ lineSolid }
							tooltipPosition="top left"
							onClick={ onMinimize }
							onTouchStart={ onMinimize }
						/>
					) }

					<Button
						className="help-center-header__close"
						label={ __( 'Close Help Center', __i18n_text_domain__ ) }
						tooltipPosition="top left"
						icon={ closeSmall }
						onClick={ onDismiss }
						onTouchStart={ onDismiss }
					/>
				</div>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterHeader;
