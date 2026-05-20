import './quote-button.scss';

import { formatNumber } from '@automattic/number-formatters';
import { Icon, quote } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSocialAnalytics } from './analytics-context';
import type { SocialPost } from '../../types';

interface QuoteButtonProps {
	post: SocialPost;
}

export function QuoteButton( { post }: QuoteButtonProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const onQuoteClick = analytics?.onQuoteClick;
	if ( ! onQuoteClick ) {
		return null;
	}
	const formatted = formatNumber( post.counts.quotes );
	const label = translate( 'Quote, %(count)s quote', 'Quote, %(count)s quotes', {
		count: post.counts.quotes,
		args: { count: formatted },
		textOnly: true,
	} );
	return (
		<button
			type="button"
			className="social-post-card-quote-button"
			aria-label={ label as string }
			onClick={ ( event ) => {
				event.stopPropagation();
				onQuoteClick( post );
			} }
		>
			<Icon icon={ quote } size={ 16 } />
			<span className="social-post-card-quote-button__count">{ formatted }</span>
		</button>
	);
}
