import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { arrowUpRight, wordpress } from '@wordpress/icons';
import { useAppContext } from '../../context';
import { formatDate } from '../format-note-time';
import type { NotePost, NoteSite } from '../../types';

export default function PostCard( { post, site }: { post: NotePost; site?: NoteSite } ) {
	const { locale } = useAppContext();
	const byline = [ post.author_name, post.date && formatDate( post.date, locale ) ]
		.filter( Boolean )
		.join( ' · ' );

	return (
		<Card
			as="a"
			className="wpnc-simplified__card"
			href={ post.url }
			target="_blank"
			rel="noreferrer"
			size="small"
		>
			<CardBody>
				<HStack alignment="top" justify="space-between" spacing={ 3 }>
					<VStack spacing={ 3 }>
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
									<Icon
										className="wpnc-simplified__site-icon is-placeholder"
										icon={ wordpress }
										size={ 36 }
									/>
								) }
								<VStack spacing={ 1 }>
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
						<Text size={ 15 } weight={ 600 } lineHeight="24px">
							{ post.title }
						</Text>
					</VStack>
					<Icon className="wpnc-simplified__card-arrow" icon={ arrowUpRight } size={ 20 } />
				</HStack>
			</CardBody>
		</Card>
	);
}
