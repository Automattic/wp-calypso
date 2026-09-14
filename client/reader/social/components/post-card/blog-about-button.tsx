import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSocialAnalytics } from './analytics-context';
import { BlogAboutModal } from './blog-about-modal';
import type { SocialPost } from '../../types';

interface BlogAboutButtonProps {
	post: SocialPost;
}

const blogAboutIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
		<path
			fill="currentColor"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M18.1829 4.48645L23.0291 9.64418L18.1829 14.8019L17.0898 13.7748L20.2662 10.3942H15.4545C15.3059 10.3942 15.041 10.3921 14.7075 10.3894C13.6949 10.3813 12.0504 10.3682 11.1114 10.3939L11.1012 10.3942H11.0909C9.82855 10.3942 8.21568 10.7119 6.94269 11.5722C5.70975 12.4055 4.75 13.773 4.75 16.0299V18.5C4.75 18.5 4.41421 18.5 4 18.5C3.58579 18.5 3.25 18.5 3.25 18.5V16.0299C3.25 13.257 4.47206 11.4315 6.10276 10.3294C7.68965 9.25694 9.61685 8.89589 11.0805 8.89419C12.0526 8.86799 13.7608 8.88167 14.7635 8.8897C15.0782 8.89222 15.3234 8.89418 15.4545 8.89418H20.2662L17.0898 5.51358L18.1829 4.48645Z"
		/>
	</svg>
);

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
				icon={ blogAboutIcon }
				iconSize={ 18 }
				label={ label }
				showTooltip
				onClick={ handleClick }
			/>
			{ isOpen && <BlogAboutModal post={ post } onClose={ () => setIsOpen( false ) } /> }
		</span>
	);
}
