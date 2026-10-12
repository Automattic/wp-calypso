import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import NoteIcon from '../../note-icon';
import CardLink from './card-link';
import type { HeaderCard } from '../data/header-card';

/** A site, or whatever else the note's header describes. */
export default function ContextCard( { title, description, icon, url }: HeaderCard ) {
	return (
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
}
