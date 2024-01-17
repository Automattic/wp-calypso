import { translate } from 'i18n-calypso';

import './style.scss';

export type ThankYouUpsellProps = {
	title: React.ReactNode;
	description: React.ReactNode;
	image: string;
	action?: React.ReactNode;
};

export default function ThankYouUpsell( {
	title,
	description,
	image,
	action,
}: ThankYouUpsellProps ) {
	return (
		<div className="thank-you__upsell">
			<div className="thank-you__upsell-image">
				<img alt="" src={ image } />
			</div>

			<div className="thank-you__upsell-content">
				<div className="thank-you__upsell-preface">{ translate( 'This might interest you' ) }</div>

				<div className="thank-you__upsell-text">
					<h3 className="thank-you__upsell-title">{ title }</h3>
					<p className="thank-you__upsell-description">{ description }</p>
				</div>

				<div className="thank-you__upsell-actions">{ action }</div>
			</div>
		</div>
	);
}
