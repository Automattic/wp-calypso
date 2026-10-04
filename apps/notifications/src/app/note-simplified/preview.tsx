import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	DropdownMenu,
	Icon,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external, moreVertical, wordpress } from '@wordpress/icons';
import clsx from 'clsx';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { formatDate } from './format-note-time';
import type { NoteView } from './note-view';
import type { ReactNode } from 'react';

// The menu sits beside the link, not inside it, since a link can't contain a button.
const CardLink = ( {
	url,
	className,
	menu,
	children,
}: {
	url?: string;
	className?: string;
	menu?: ReactNode;
	children: ReactNode;
} ) => (
	<div className={ clsx( 'wpnc-simplified__card', className ) }>
		{ url ? (
			<a className="wpnc-simplified__card-body" href={ url } target="_blank" rel="noreferrer">
				{ children }
			</a>
		) : (
			<div className="wpnc-simplified__card-body">{ children }</div>
		) }
		{ menu && <div className="wpnc-simplified__card-menu">{ menu }</div> }
	</div>
);

const SubscriptionMenu = ( { url }: { url: string } ) => (
	<DropdownMenu
		icon={ moreVertical }
		label={ __( 'More options' ) }
		toggleProps={ { size: 'small' } }
		// Rendered in place, like the panel's other menus, so it stays with the flyout.
		popoverProps={ { inline: true, placement: 'bottom-end' } }
	>
		{ ( { onClose } ) => (
			<MenuGroup>
				<MenuItem
					icon={ external }
					iconPosition="right"
					onClick={ () => {
						window.open( url, '_blank', 'noopener' );
						onClose();
					} }
				>
					{ __( 'Manage subscription' ) }
				</MenuItem>
			</MenuGroup>
		) }
	</DropdownMenu>
);

export const ContextCard = ( {
	title,
	description,
	icon,
	url,
}: NonNullable< NoteView[ 'card' ] > ) => (
	<CardLink url={ url }>
		<HStack alignment="top" justify="flex-start" spacing={ 3 }>
			{ icon && <NoteIcon className="wpnc-simplified__site-icon" icon={ icon } size={ 40 } /> }
			<VStack spacing={ 1 }>
				<Text weight={ 600 }>{ title }</Text>
				{ description && (
					<Text variant="muted" truncate numberOfLines={ 2 }>
						{ description }
					</Text>
				) }
			</VStack>
		</HStack>
	</CardLink>
);

export const PostCard = ( {
	title,
	excerpt,
	url,
	isFeatured,
	image,
	siteName,
	siteIcon,
	author,
	date,
	subscriptionUrl,
}: NonNullable< NoteView[ 'post' ] > ) => {
	const { locale } = useAppContext();
	const byline = [ author, date && formatDate( date, locale ) ].filter( Boolean ).join( ' · ' );

	// A post that is the news shows its image, under a row that already says who
	// published it and when. Anywhere else it is a reference, introduced by its site.
	return (
		<CardLink
			url={ url }
			className={ clsx( { 'is-featured': isFeatured } ) }
			menu={ subscriptionUrl && <SubscriptionMenu url={ subscriptionUrl } /> }
		>
			{ isFeatured && image && (
				<img className="wpnc-simplified__card-image" src={ image } alt="" />
			) }
			<VStack className="wpnc-simplified__card-text" spacing={ 2 }>
				{ ! isFeatured && (
					<span className="wpnc-simplified__card-arrow" aria-hidden="true">
						&#8599;
					</span>
				) }
				{ ! isFeatured && ( siteName || byline ) && (
					<HStack justify="flex-start" spacing={ 2 }>
						{ siteIcon ? (
							<img
								className="wpnc-simplified__site-icon"
								src={ siteIcon }
								alt=""
								width={ 32 }
								height={ 32 }
							/>
						) : (
							// The block editor's own stand-in for a site without an icon.
							<Icon
								className="wpnc-simplified__site-icon is-placeholder"
								icon={ wordpress }
								size={ 32 }
							/>
						) }
						<VStack spacing={ 0 }>
							{ siteName && (
								<Text size={ 12 } weight={ 600 }>
									{ siteName }
								</Text>
							) }
							{ byline && (
								<Text size={ 12 } variant="muted">
									{ byline }
								</Text>
							) }
						</VStack>
					</HStack>
				) }
				{ title && (
					<Text size={ 15 } weight={ 600 }>
						{ title }
					</Text>
				) }
				{ excerpt && (
					<Text variant="muted" truncate numberOfLines={ isFeatured ? 3 : 2 }>
						{ excerpt }
					</Text>
				) }
			</VStack>
		</CardLink>
	);
};
