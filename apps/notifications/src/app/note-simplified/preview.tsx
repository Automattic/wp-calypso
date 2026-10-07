import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { formatDate } from './format-note-time';
import type { NoteView } from './note-view';
import type { ReactNode } from 'react';

const CardLink = ( { url, children }: { url?: string; children: ReactNode } ) =>
	url ? (
		<a className="wpnc-simplified__card" href={ url } target="_blank" rel="noreferrer">
			{ children }
		</a>
	) : (
		<div className="wpnc-simplified__card">{ children }</div>
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
	siteName,
	siteIcon,
	author,
	date,
}: NonNullable< NoteView[ 'post' ] > ) => {
	const { locale } = useAppContext();
	const byline = [ author, date && formatDate( date, locale ) ].filter( Boolean ).join( ' · ' );

	return (
		<CardLink url={ url }>
			<VStack className="wpnc-simplified__card-text" spacing={ 4 }>
				<span className="wpnc-simplified__card-arrow" aria-hidden="true">
					&#8599;
				</span>
				{ ( siteName || byline ) && (
					<HStack justify="flex-start" spacing={ 3 }>
						{ siteIcon ? (
							<img
								className="wpnc-simplified__site-icon"
								src={ siteIcon }
								alt=""
								width={ 36 }
								height={ 36 }
							/>
						) : (
							// The block editor's own stand-in for a site without an icon.
							<Icon
								className="wpnc-simplified__site-icon is-placeholder"
								icon={ wordpress }
								size={ 36 }
							/>
						) }
						<VStack spacing={ 0 }>
							{ siteName && (
								<Text size={ 12 } weight={ 600 } truncate>
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
				{ ( title || excerpt ) && (
					<VStack spacing={ 2 }>
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
				) }
			</VStack>
		</CardLink>
	);
};
