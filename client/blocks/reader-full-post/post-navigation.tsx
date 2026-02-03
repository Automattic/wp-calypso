import { Gridicon } from '@automattic/components';
import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
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

const NavigationButton = ( { direction, post, postKey, onNavigate }: NavigationButtonProps ) => {
	const translate = useTranslate();
	const isNext = direction === 'next';
	const label = isNext ? translate( 'Next post' ) : translate( 'Previous post' );
	const icon = isNext ? 'chevron-right' : 'chevron-left';

	if ( ! postKey ) {
		return <div className="reader-full-post-navigation__link-placeholder" />;
	}

	return (
		<Button
			onClick={ () => onNavigate( postKey ) }
			className={ clsx(
				'reader-full-post-navigation__link-button',
				isNext && 'reader-full-post-navigation__link-button--next'
			) }
			aria-label={ String(
				translate( '%(label)s: %(title)s', {
					args: { label: String( label ), title: post?.title || String( label ) },
				} )
			) }
		>
			<HStack spacing={ 2 } justify={ isNext ? 'flex-end' : 'flex-start' } expanded>
				{ ! isNext && <Gridicon icon={ icon } size={ 18 } /> }
				<VStack
					spacing={ 1 }
					className={ clsx(
						'reader-full-post-navigation__link-content',
						isNext && 'reader-full-post-navigation__link-content--next'
					) }
				>
					<span className="reader-full-post-navigation__link-label">{ label }</span>
					<span className="reader-full-post-navigation__link-title">
						{ post?.title || translate( 'Loading…' ) }
					</span>
				</VStack>
				{ isNext && <Gridicon icon={ icon } size={ 18 } /> }
			</HStack>
		</Button>
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
			<HStack spacing={ 6 } alignment="stretch">
				<div className="reader-full-post-navigation__link">
					<NavigationButton
						direction="previous"
						post={ previousPost }
						postKey={ previousPostKey }
						onNavigate={ onNavigate }
					/>
				</div>
				<div className="reader-full-post-navigation__link">
					<NavigationButton
						direction="next"
						post={ nextPost }
						postKey={ nextPostKey }
						onNavigate={ onNavigate }
					/>
				</div>
			</HStack>
		</VStack>
	);
};

export default ReaderFullPostNavigation;
