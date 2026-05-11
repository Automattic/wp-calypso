import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Modal, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { SiteHandoff } from 'calypso/reader/social/site-handoff';
import { useSocialAnalytics } from './analytics-context';
import { buildEmbedBlock } from './build-embed-block';
import type { SocialPost } from '../../types';

interface BlogAboutModalProps {
	post: SocialPost;
	onClose: () => void;
}

export function BlogAboutModal( { post, onClose }: BlogAboutModalProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const source = analytics?.source ?? 'unknown';
	const connectionId = analytics?.connectionId;
	const submittedRef = useRef( false );

	const { data: sites, isPending, isError } = useQuery( sitesQuery( 'all' ) );

	const shownRef = useRef( false );
	useEffect( () => {
		if ( shownRef.current ) {
			return;
		}
		if ( isPending ) {
			return;
		}
		shownRef.current = true;
		analytics?.onClick( `calypso_reader_${ source }_blog_about_shown`, {
			connection_id: connectionId,
			post_uri: post.uri,
			site_count: sites?.length ?? 0,
		} );
	}, [ analytics, connectionId, isPending, post.uri, sites, source ] );

	const handleClose = () => {
		if ( ! submittedRef.current ) {
			analytics?.onClick( `calypso_reader_${ source }_blog_about_dismissed`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
		}
		onClose();
	};

	const content = buildEmbedBlock( post.permalink );

	const tracks = {
		editorOpened: ( siteId: number ) => {
			submittedRef.current = true;
			return {
				event: `calypso_reader_${ source }_blog_about_editor_opened`,
				props: {
					connection_id: connectionId,
					post_uri: post.uri,
					site_id: siteId,
				},
			};
		},
		errorShown: ( siteId: number, errorKind: string ) => ( {
			event: `calypso_reader_${ source }_blog_about_error_shown`,
			props: {
				connection_id: connectionId,
				post_uri: post.uri,
				site_id: siteId,
				error_kind: errorKind,
			},
		} ),
	};

	return (
		<Modal
			title={ translate( 'Blog about this post' ) as string }
			onRequestClose={ handleClose }
			size="medium"
		>
			<p>
				{ translate(
					'Turn this into something longer on your own site. We’ll open the editor with the post embedded, ready for your take.'
				) }
			</p>
			{ isPending && <Spinner /> }
			{ isError && <p>{ translate( 'We couldn’t load your sites. Try again in a moment.' ) }</p> }
			{ ! isPending && ! isError && sites && sites.length === 0 && (
				<p>
					{ translate(
						'You’ll need a WordPress site to blog about this post. {{a}}Create a site{{/a}}.',
						{
							components: { a: <a href="/start" /> },
						}
					) }
				</p>
			) }
			{ ! isPending && ! isError && sites && sites.length > 0 && ! content && (
				<p>
					{ translate(
						'We couldn’t prepare an embed for this post. Try again from another post.'
					) }
				</p>
			) }
			{ ! isPending && ! isError && sites && sites.length > 0 && content && (
				<SiteHandoff
					sites={ sites }
					content={ content }
					buttonLabel={ translate( 'Start writing' ) as string }
					tracks={ tracks }
					caller="blog_about"
					onSuccess={ onClose }
				/>
			) }
		</Modal>
	);
}
