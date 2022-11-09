import classNames from 'classnames';
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
	const { title, message, isMobile } = data;
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
				<p className="promo-card__title">{ title }</p>
				<p className="promo-card__message">{ message }</p>
			</div>
			<div className="promo-rhs">
				{ ! isMobile && <QRCodeSVG /> }
				{ isMobile && <AppStoreSVG /> }
			</div>
		</div>
	);
}
