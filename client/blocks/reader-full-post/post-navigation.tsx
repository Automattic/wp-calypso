import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './post-navigation.scss';

interface PostKey {
	feedId?: number;
	blogId?: number;
	postId: number;
}

interface Post {
	title?: string;
}

interface NavigationButtonProps {
	direction: 'previous' | 'next';
	post: Post | null;
	postKey: PostKey | null;
	onNavigate: ( postKey: PostKey ) => void;
}

/**
 * Generates the URL for a reader post from a PostKey.
 */
function getPostUrlFromKey( postKey: PostKey ): string {
	if ( postKey.feedId ) {
		return `/reader/feeds/${ postKey.feedId }/posts/${ postKey.postId }`;
	}
	return `/reader/blogs/${ postKey.blogId }/posts/${ postKey.postId }`;
}

const NavigationButton = ( { direction, post, postKey, onNavigate }: NavigationButtonProps ) => {
	const translate = useTranslate();
	const isNext = direction === 'next';
	const label = isNext ? translate( 'Next post' ) : translate( 'Previous post' );
	const icon = isNext ? chevronRight : chevronLeft;

	if ( ! postKey ) {
		return <div className="reader-full-post-navigation__link-placeholder" />;
	}

	const handleClick = ( event: React.MouseEvent ) => {
		// Allow default behavior for modifier keys (open in new tab)
		if ( event.metaKey || event.ctrlKey || event.shiftKey ) {
			return;
		}
		event.preventDefault();
		onNavigate( postKey );
	};

	return (
		<a
			href={ getPostUrlFromKey( postKey ) }
			onClick={ handleClick }
			className={ clsx( 'reader-full-post-navigation__link-button', {
				'reader-full-post-navigation__link-button--next': isNext,
			} ) }
			aria-label={ String(
				translate( '%(label)s: %(title)s', {
					args: { label: String( label ), title: post?.title || String( label ) },
				} )
			) }
		>
			<HStack spacing={ 2 } justify={ isNext ? 'flex-end' : 'flex-start' } expanded>
				{ ! isNext && <Icon icon={ icon } size={ 18 } /> }
				<VStack
					spacing={ 1 }
					className={ clsx( 'reader-full-post-navigation__link-content', {
						'reader-full-post-navigation__link-content--next': isNext,
					} ) }
				>
					<span className="reader-full-post-navigation__link-label">{ label }</span>
					<Text className="reader-full-post-navigation__link-title" truncate numberOfLines={ 2 }>
						{ post?.title || translate( 'Loading…' ) }
					</Text>
				</VStack>
				{ isNext && <Icon icon={ icon } size={ 18 } /> }
			</HStack>
		</a>
	);
};

interface ReaderFullPostNavigationProps {
	previousPost: Post | null;
	nextPost: Post | null;
	previousPostKey: PostKey | null;
	nextPostKey: PostKey | null;
	onNavigate: ( postKey: PostKey ) => void;
}

const ReaderFullPostNavigation = ( {
	previousPost,
	nextPost,
	previousPostKey,
	nextPostKey,
	onNavigate,
}: ReaderFullPostNavigationProps ) => {
	if ( ! previousPostKey && ! nextPostKey ) {
		return null;
	}

	return (
		<VStack spacing={ 6 } className="reader-full-post-navigation">
			<Divider />
			<HStack spacing={ 6 } justify="space-between">
				<NavigationButton
					direction="previous"
					post={ previousPost }
					postKey={ previousPostKey }
					onNavigate={ onNavigate }
				/>
				<NavigationButton
					direction="next"
					post={ nextPost }
					postKey={ nextPostKey }
					onNavigate={ onNavigate }
				/>
			</HStack>
		</VStack>
	);
};

export default ReaderFullPostNavigation;
