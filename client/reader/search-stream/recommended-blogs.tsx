import { __experimentalHeading as Heading } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
import { useId } from 'react';
import { RecommendedBlogGroups } from 'calypso/reader/components/recommended-blog-groups';
import { useFollowedTags } from 'calypso/reader/data/tags';
import { getRecommendedBlogGroups } from 'calypso/reader/onboarding-rsm/recommended-blogs/groups';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './recommended-blogs.scss';

function FollowedInterestRecommendations() {
	const { data: followedTags, isPending, isError } = useFollowedTags();
	const headingId = useId();
	if ( isPending || isError || ! followedTags ) {
		return null;
	}
	const groups = getRecommendedBlogGroups( followedTags.map( ( tag ) => tag.slug ) );
	if ( groups.length === 0 ) {
		return null;
	}

	return (
		<section className="search-stream__recommended-blogs" aria-labelledby={ headingId }>
			<Heading level={ 2 } id={ headingId } className="search-stream__recommended-blogs-title">
				{ __( 'Blogs to follow' ) }
			</Heading>
			<RecommendedBlogGroups groups={ groups } mode="follow" followSource="reader-search" />
		</section>
	);
}

export function SearchRecommendedBlogs() {
	const isLoggedIn = useSelector( isUserLoggedIn );
	if ( ! isLoggedIn || ! getLocaleSlug()?.startsWith( 'en' ) ) {
		return null;
	}
	return <FollowedInterestRecommendations />;
}
