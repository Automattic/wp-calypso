import classNames from 'classnames';
import './style.scss';
import { AppStoreSVG, JetpackSVG, QRCodeSVG, WordPressSVG } from './svg-icons';

export type PromoCardProps = {
	className?: string;
	data: {
		title: string | null;
		message: string | null;
		cta?: string;
	};
};

export default function PromoCard( { className, data: { title, message, cta } }: PromoCardProps ) {
	const isAppStore = cta === 'app-store';
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
				{ ! isAppStore && <QRCodeSVG /> }
				{ isAppStore && <AppStoreSVG /> }
			</div>
		</div>
	);
}
