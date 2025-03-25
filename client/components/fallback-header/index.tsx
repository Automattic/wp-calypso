import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

const FallbackHeader = () => {
	return (
		<div className="fallback-signup" role="banner" aria-label="banner">
			<WordPressLogo size={ 24 } className="wordpress-logo" />
		</div>
	);
};

export default FallbackHeader;
