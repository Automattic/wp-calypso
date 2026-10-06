import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import clsx from 'clsx';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { formatDate } from './format-note-time';
import type { NoteView } from './note-view';
import type { ReactNode } from 'react';

const CardLink = ( {
	url,
	className,
	children,
}: {
	url?: string;
	className?: string;
	children: ReactNode;
} ) => {
	const classes = clsx( 'wpnc-simplified__card', className );
	return url ? (
		<a className={ classes } href={ url } target="_blank" rel="noreferrer">
			{ children }
		</a>
	) : (
		<div className={ classes }>{ children }</div>
	);
};

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

const SiteByline = ( {
	siteIcon,
	siteName,
	byline,
}: {
	siteIcon?: string;
	siteName?: string;
	byline?: string;
} ) => (
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
			<Icon className="wpnc-simplified__site-icon is-placeholder" icon={ wordpress } size={ 32 } />
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
);

const useByline = ( author?: string, date?: string ) => {
	const { locale } = useAppContext();
	return [ author, date && formatDate( date, locale ) ].filter( Boolean ).join( ' · ' );
};

/** A post referenced by a comment, a like or a reblog, introduced by its site. */
export const PostCard = ( {
	title,
	excerpt,
	url,
	siteName,
	siteIcon,
	author,
	date,
}: NonNullable< NoteView[ 'post' ] > ) => {
	const byline = useByline( author, date );

	return (
		<CardLink url={ url }>
			<VStack className="wpnc-simplified__card-text" spacing={ 2 }>
				<span className="wpnc-simplified__card-arrow" aria-hidden="true">
					&#8599;
				</span>
				{ ( siteName || byline ) && (
					<SiteByline siteIcon={ siteIcon } siteName={ siteName } byline={ byline } />
				) }
				{ title && (
					<Text size={ 15 } weight={ 600 }>
						{ title }
					</Text>
				) }
				{ excerpt && (
					<Text variant="muted" truncate numberOfLines={ 2 }>
						{ excerpt }
					</Text>
				) }
			</VStack>
		</CardLink>
	);
};

/** A newly published post, laid out in the panel itself: the post is the note. */
export const PostPreview = ( {
	title,
	excerpt,
	url,
	image,
	siteName,
	siteIcon,
	author,
	date,
}: NonNullable< NoteView[ 'post' ] > ) => {
	const byline = useByline( author, date );

	return (
		<VStack className="wpnc-simplified__quiet-links" spacing={ 3 }>
			{ image && (
				<a href={ url } target="_blank" rel="noreferrer" tabIndex={ -1 } aria-hidden="true">
					<img className="wpnc-simplified__post-image" src={ image } alt="" />
				</a>
			) }
			{ ( siteName || byline ) && (
				<SiteByline siteIcon={ siteIcon } siteName={ siteName } byline={ byline } />
			) }
			{ title && (
				<Text size={ 15 } weight={ 600 }>
					<a href={ url } target="_blank" rel="noreferrer">
						{ title }
					</a>
				</Text>
			) }
			{ excerpt && <Text variant="muted">{ excerpt }</Text> }
		</VStack>
	);
};
