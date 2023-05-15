import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

interface Props {
	siteName?: string;
}

export default function PoweredByWPFooter( { siteName }: Props ) {
	const translate = useTranslate();

	function renderPoweredByWP() {
		return (
			<>
				<WordPressLogo size={ 20 } className="powered-by-wp-footer__logo" />
				<span>{ translate( 'Powered by WordPress.com' ) }</span>
			</>
		);
	}

	function renderPoweredByWPWithSiteName() {
		const wording = translate( '%s is powered by <logo/> WordPress.com', {
			args: siteName,
		} ) as string;

		return createInterpolateElement( wording, {
			logo: <WordPressLogo size={ 20 } className="powered-by-wp-footer__logo" />,
		} );
	}

	return (
		<footer className="powered-by-wp-footer">
			<div className="powered-by-wp-footer__info">
				{ siteName ? renderPoweredByWPWithSiteName() : renderPoweredByWP() }
			</div>
		</footer>
	);
}
