import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import BloganuaryIcon from 'calypso/components/blogging-prompt-card/bloganuary-icon';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

const BloganuaryHeader = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const trackBloganuaryMoreInfoClick = () => {
		dispatch( recordTracksEvent( 'reader_bloganuary_more_info_click' ) );
	};

	if ( ! isBloganuary() ) {
		return;
	}

	return (
		<div className="bloganuary-header">
			<div>
				<BloganuaryIcon />
				<span className="bloganuary-header__title">{ translate( 'Bloganuary' ) }</span>
			</div>
			<a
				href="https://wordpress.com/bloganuary"
				className="bloganuary-header__link button"
				target="_blank"
				rel="noopener noreferrer"
				onClick={ trackBloganuaryMoreInfoClick }
			>
				{ translate( 'Learn more' ) }
			</a>
		</div>
	);
};

export default BloganuaryHeader;
