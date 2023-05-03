import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

interface Props {
	text?: string;
}

export default function PoweredByWPFooter( { text }: Props ) {
	const translate = useTranslate();

	return (
		<footer className="powered-by-wp-footer">
			<div className="powered-by-wp-footer__info">
				<WordPressLogo size={ 20 } className="powered-by-wp-footer__logo" />
				<span>{ text || translate( 'Powered by WordPress.com' ) }</span>
			</div>
		</footer>
	);
}
