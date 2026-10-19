import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import NoteIcon from '../../note-icon';
import { NoteTime } from './note-meta';
import type { NoteActor, NoteParentComment } from '../../types';
import type { ReactNode } from 'react';

const ThreadItem = ( {
	avatar,
	author,
	authorUrl,
	meta,
	status,
	children,
}: {
	avatar?: string | null;
	author?: string;
	authorUrl?: string | null;
	meta?: ReactNode;
	status?: ReactNode;
	children: ReactNode;
} ) => {
	const photo = (
		<NoteIcon className="wpnc-simplified__photo" icon={ avatar ?? undefined } size={ 36 } />
	);
	const name = author && (
		<Text size={ 15 } weight={ 600 }>
			{ authorUrl ? (
				<a href={ authorUrl } target="_blank" rel="noreferrer">
					{ author }
				</a>
			) : (
				author
			) }
		</Text>
	);

	return (
		<VStack as="li" spacing={ 3 }>
			<HStack alignment="top" justify="flex-start" spacing={ 3 }>
				{ authorUrl ? (
					// The name beside it links to the same profile, so the photo stays out of the tab order.
					<a
						className="wpnc-simplified__photo"
						href={ authorUrl }
						target="_blank"
						rel="noreferrer"
						tabIndex={ -1 }
						aria-hidden="true"
					>
						{ photo }
					</a>
				) : (
					photo
				) }
				<VStack className="wpnc-simplified__quiet-links" spacing={ 0 } style={ { flex: 1 } }>
					{ name }
					{ meta }
				</VStack>
				{ status }
			</HStack>
			{ children }
		</VStack>
	);
};

export default function Thread( {
	repliedTo,
	truncate = false,
	commenter,
	meta,
	status,
	children,
}: {
	repliedTo?: NoteParentComment;
	truncate?: boolean;
	commenter?: NoteActor;
	meta?: ReactNode;
	status?: ReactNode;
	children?: ReactNode;
} ) {
	return (
		<VStack as="ol" className="wpnc-simplified__thread" spacing={ 4 }>
			{ repliedTo && (
				<ThreadItem
					avatar={ repliedTo.author_avatar }
					author={ repliedTo.author_name }
					authorUrl={ repliedTo.author_url }
					meta={
						repliedTo.date && (
							<Text className="wpnc-simplified__quiet-links" size={ 12 } variant="muted">
								<NoteTime timestamp={ repliedTo.date } url={ repliedTo.url } />
							</Text>
						)
					}
				>
					<div
						className={ clsx( 'wpnc-simplified__parent-text', {
							'is-truncated': truncate,
						} ) }
					>
						{ repliedTo.text }
					</div>
				</ThreadItem>
			) }
			{ commenter && (
				<ThreadItem
					avatar={ commenter.avatar }
					author={ commenter.name }
					authorUrl={ commenter.url }
					meta={ meta }
					status={ status }
				>
					{ children }
				</ThreadItem>
			) }
		</VStack>
	);
}
