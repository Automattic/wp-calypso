import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import { AppStoreSVG, JetpackSVG, QRCodeSVG, WordPressSVG } from './svg-icons';

export type PromoCardProps = {
	className?: string;
	data: {
		title: string | null;
		message: string | null;
		isMobile?: boolean;
	};
};

export default function PromoCard( { className, data }: PromoCardProps ) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { title, message, isMobile } = data;
	// Using useTranslate() with interpolation to set up the title/message.
	// https://wpcalypso.wordpress.com/devdocs/packages/i18n-calypso/README.md
	const translate = useTranslate();
	const components = {
		a: <a href="https://wp.com/apps" />,
	};
	const getTitle = () => {
		return translate( 'Bring your stats with you using the {{a}}Jetpack{{/a}} mobile app', {
			components,
		} );
	};
	const getMessage = () => {
		let string;
		if ( isMobile ) {
			string = translate(
				'Check your stats on-the-go and get real-time notifications with the Jetpack mobile app.'
			);
		} else {
			string = translate(
				'Visit {{a}}wp.com/app{{/a}} or scan the QR code to download the Jetpack mobile app.',
				{ components }
			);
		}
		return string;
	};
	// ToDo: Fix mobile logic.
	// Should this maybe come via a media query in the CSS?
	// Also, does it make sense to push one app store over the other?
	// Might make more sense to have a custom SVG image that goes to wp.com/app.
	return (
		<div className={ classNames( 'promo-card', className ?? null ) }>
			<div className="promo-lhs">
				<div className="promo-card__icons">
					<WordPressSVG />
					<JetpackSVG className="secondary" />
				</div>
				<p className="promo-card__title">{ getTitle() }</p>
				<p className="promo-card__message">{ getMessage() }</p>
			</div>
			<div className="promo-rhs">
				{ ! isMobile && <QRCodeSVG /> }
				{ isMobile && <AppStoreSVG /> }
			</div>
		</div>
	);
}
