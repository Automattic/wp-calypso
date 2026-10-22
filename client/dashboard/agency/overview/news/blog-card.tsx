import {
	Button,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardDivider, CardHeader, CardMedia } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import SummaryButton from '../../../components/summary-button';
import NewTabLabel from '../../components/new-tab-label';
import { AnnouncementCtas, AnnouncementDescription, bindLastWords } from './announcement-parts';
import { BLOG_URL } from './announcements';
import type { AnnouncementActionProps } from './announcement-parts';
import type { Announcement } from './announcements';

const DIVIDER_STYLE = { borderColor: 'var(--color-gray-100)' };
const HEADER_STYLE = { flexDirection: 'column', alignItems: 'stretch' } as const;
// The newest post gets the image; two more follow as links, so the card stays shorter
// than News and updates above it.
const MAX_POSTS = 3;

interface BlogCardProps extends AnnouncementActionProps {
	/** Blog posts, newest first, as the server returns them. */
	posts: Announcement[];
}

/**
 * Blog posts on the agency Overview, in their own card below News and updates: posts
 * lead with their image and aren't tied to a date, so they don't share the dated list.
 */
export default function BlogCard( { posts, recordTracksEvent, ...actionProps }: BlogCardProps ) {
	const [ featured, ...rest ] = posts.slice( 0, MAX_POSTS );
	if ( ! featured ) {
		return null;
	}

	return (
		<Card className="a4a-blog">
			{ /* As on the site Overview's Domains card, so the action sits at the far end. */ }
			<CardHeader style={ HEADER_STYLE }>
				<SectionHeader
					level={ 3 }
					title={ __( 'From the blog' ) }
					actions={
						<Button
							__next40pxDefaultSize
							size="compact"
							variant="tertiary"
							href={ BLOG_URL }
							target="_blank"
							rel="noreferrer"
							onClick={ () => recordTracksEvent?.( 'calypso_a4a_overview_blog_view_all_click' ) }
						>
							<NewTabLabel>{ __( 'View all posts' ) }</NewTabLabel>
						</Button>
					}
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					{ featured.image && (
						<CardMedia className="a4a-blog-media">
							{ /* WordPress.com resizes uploads on the fly; ask for a 2x image of the card. */ }
							<img src={ `${ featured.image }?w=1040` } alt="" />
						</CardMedia>
					) }
					<VStack spacing={ 1 }>
						<Heading
							level={ 4 }
							size={ 13 }
							weight={ 500 }
							lineHeight="20px"
							className="a4a-news-balance"
						>
							{ bindLastWords( featured.headline ) }
						</Heading>
						<AnnouncementDescription announcement={ featured } />
					</VStack>
					<AnnouncementCtas
						announcement={ featured }
						recordTracksEvent={ recordTracksEvent }
						{ ...actionProps }
					/>
				</VStack>
			</CardBody>
			{ rest.length > 0 && <CardDivider style={ DIVIDER_STYLE } /> }
			{ rest.map( ( post ) => (
				<SummaryButton
					key={ post.id }
					density="medium-low"
					title={
						<NewTabLabel justify="flex-start">{ bindLastWords( post.headline ) }</NewTabLabel>
					}
					description={ bindLastWords( post.description ) }
					href={ post.primaryCta.url }
					target="_blank"
					rel="noreferrer"
					showArrow={ false }
					onClick={ () =>
						recordTracksEvent?.( 'calypso_a4a_overview_event_cta_click', {
							event_id: post.id,
							cta_id: 'primary',
						} )
					}
				/>
			) ) }
		</Card>
	);
}
