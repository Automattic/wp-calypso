import { Button } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSocialAnalytics } from './analytics-context';
import { BlogAboutModal } from './blog-about-modal';
import type { SocialPost } from '../../types';

interface BlogAboutButtonProps {
	post: SocialPost;
}

export function BlogAboutButton( { post }: BlogAboutButtonProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const [ isOpen, setIsOpen ] = useState( false );

	const label = translate( 'Blog about this post' ) as string;

	const handleClick = () => {
		analytics?.onClick( `calypso_reader_${ analytics.source }_blog_about_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: post.uri,
		} );
		setIsOpen( true );
	};

	return (
		<span className="social-post-card-counts__blog-about">
			<Button
				className="social-post-card-counts__blog-about-button"
				variant="tertiary"
				size="small"
				icon={ wordpress }
				label={ label }
				showTooltip
				onClick={ handleClick }
			/>
			{ isOpen && <BlogAboutModal post={ post } onClose={ () => setIsOpen( false ) } /> }
		</span>
	);
}
