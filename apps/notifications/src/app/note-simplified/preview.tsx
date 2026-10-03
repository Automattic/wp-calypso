import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
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
}: NonNullable< NoteView[ 'post' ] > ) => {
	const { locale } = useAppContext();
	const byline = [ author, date && formatDate( date, locale ) ].filter( Boolean ).join( ' · ' );

	// A post that is the news shows its image, under a row that already says who
	// published it and when. Anywhere else it is a reference, introduced by its site.
	return (
		<CardLink url={ url } className={ clsx( { 'is-featured': isFeatured } ) }>
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
						{ siteIcon && (
							<img
								className="wpnc-simplified__site-icon"
								src={ siteIcon }
								alt=""
								width={ 32 }
								height={ 32 }
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
