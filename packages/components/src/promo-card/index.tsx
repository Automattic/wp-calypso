import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import { AppStoreSVG, QRCodeSVG, WordPressJetpackSVG } from './svg-icons';

export type PromoCardProps = {
	className?: string;
	isMobile?: boolean;
};

export default function PromoCard( { className, isMobile }: PromoCardProps ) {
	// Using useTranslate() with interpolation to set up the title/message.
	// https://wpcalypso.wordpress.com/devdocs/packages/i18n-calypso/README.md
	const translate = useTranslate();
	const components = {
		a: <a href="https://jetpack.com/app/" />,
	};
	// TODO: Fix mobile logic.
	// Should this maybe come via a media query in the CSS?
	// Also, does it make sense to push one app store over the other?
	// Might make more sense to have a custom "app store" SVG image that goes to wp.com/app.

	// TODO: Remove (or update) QRCodeSVG component/data.
	// Pulling the QR code from the jetpack.com site for now.
	// Site: https://jetpack.com/mobile/
	// Image URL: https://s0.wp.com/wp-content/themes/a8c/jetpackme-new/images/landing-pages/jetpack-app-get-2x.png
	return (
		<div className={ classNames( 'promo-card', className ?? null ) }>
			<div className="promo-lhs">
				<div className="promo-card__icons">
					<WordPressJetpackSVG />
				</div>
				<p className="promo-card__title">
					{ translate( 'Bring your stats with you using the {{a}}Jetpack{{/a}} mobile app', {
						components,
					} ) }
				</p>
				<p className="promo-card__message">
					{ isMobile
						? translate(
								'Check your stats on-the-go and get real-time notifications with the Jetpack mobile app.'
						  )
						: translate(
								'Visit {{a}}jetpack.com/app{{/a}} or scan the QR code to download the Jetpack mobile app.',
								{ components }
						  ) }
				</p>
			</div>
			<div className="promo-rhs">
				{ false && ! isMobile && <QRCodeSVG /> }
				{ isMobile && <AppStoreSVG /> }
				{ ! isMobile && (
					<a href="https://jetpack.com">
						<img
							className="jetpack-qr-code"
							src="https://s0.wp.com/wp-content/themes/a8c/jetpackme-new/images/landing-pages/jetpack-app-get-2x.png"
							alt="QR Code for Jetpack mobile app"
						/>
					</a>
				) }
			</div>
		</div>
	);
}
