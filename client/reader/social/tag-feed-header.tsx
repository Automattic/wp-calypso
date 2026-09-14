import './tag-feed-header.scss';

import { useTranslate } from 'i18n-calypso';

interface SocialTagFeedHeaderProps {
	hashtag: string;
	count?: number | null;
}

export function SocialTagFeedHeader( { hashtag, count }: SocialTagFeedHeaderProps ) {
	const translate = useTranslate();
	const countLine =
		typeof count === 'number'
			? translate( '%(count)d post', '%(count)d posts', {
					count,
					args: { count },
			  } )
			: null;

	return (
		<div className="social-tag-feed-header">
			<h1 className="social-tag-feed-header__heading">{ `#${ hashtag }` }</h1>
			{ countLine ? <p className="social-tag-feed-header__count">{ countLine }</p> : null }
		</div>
	);
}
