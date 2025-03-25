import Loading from 'calypso/components/loading';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

type FallbackContentProps = {
	title?: string;
	withLoading?: boolean;
};

const FallbackContent = ( { title = '', withLoading = true }: FallbackContentProps ) => {
	return (
		<div className="fallback-signup-header">
			<div className="fallback-signup" role="banner" aria-label="banner">
				<WordPressLogo size={ 24 } className="wordpress-logo" />
			</div>
			{ withLoading && <Loading title={ title } /> }
		</div>
	);
};

export default FallbackContent;
