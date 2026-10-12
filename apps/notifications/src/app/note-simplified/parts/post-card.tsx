import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useAppContext } from '../../context';
import { formatDate } from '../format-note-time';
import type { NotePost, NoteSite } from '../../types';

/** The post a note is about: its site and author, then its title. */
export default function PostCard( { post, site }: { post: NotePost; site?: NoteSite } ) {
	const { locale } = useAppContext();
	const byline = [ post.author_name, post.date && formatDate( post.date, locale ) ]
		.filter( Boolean )
		.join( ' · ' );

	return (
		<a className="wpnc-simplified__card" href={ post.url } target="_blank" rel="noreferrer">
			<VStack className="wpnc-simplified__card-text" spacing={ 4 }>
				<span className="wpnc-simplified__card-arrow" aria-hidden="true">
					&#8599;
				</span>
				{ site && (
					<HStack justify="flex-start" spacing={ 3 }>
						{ site.icon ? (
							<img
								className="wpnc-simplified__site-icon"
								src={ site.icon }
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
							<Text size={ 13 } weight={ 600 } truncate>
								{ site.name }
							</Text>
							{ byline && (
								<Text size={ 12 } variant="muted">
									{ byline }
								</Text>
							) }
						</VStack>
					</HStack>
				) }
				<Text size={ 15 } weight={ 600 }>
					{ post.title }
				</Text>
			</VStack>
		</a>
	);
}
