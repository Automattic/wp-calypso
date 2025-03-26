import { useI18n } from '@wordpress/react-i18n';
import Loading from 'calypso/components/loading';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

type FallbackContentProps = {
	title?: string;
	withLoading?: boolean;
};

const FallbackContent = ( { title, withLoading = true }: FallbackContentProps ) => {
	const { __ } = useI18n();
	const loadingTitle = title ?? __( 'Turning on the lights' );
	return (
		<div className="fallback-signup-header">
			<div className="fallback-signup" role="banner" aria-label="banner">
				<WordPressLogo size={ 24 } className="wordpress-logo" />
			</div>
			{ withLoading && <Loading title={ loadingTitle } /> }
		</div>
	);
};

export default FallbackContent;
