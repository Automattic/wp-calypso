import { useTranslate } from 'i18n-calypso';

import './style.scss';

export type ThankYouUpsellProps = {
	title: React.ReactNode;
	description: React.ReactNode;
	image: string;
	actions?: React.ReactNode;
};

export default function ThankYouUpsell( {
	title,
	description,
	image,
	actions,
}: ThankYouUpsellProps ) {
	const translate = useTranslate();

	return (
		<div className="thank-you__upsell">
			<div className="thank-you__upsell-image">
				<img alt="" src={ image } />
			</div>

			<div className="thank-you__upsell-content">
				<div className="thank-you__upsell-preface">
					{ translate( 'This might interest you', {
						comment: 'General introductory heading for upsell banner on checkout thank you page',
					} ) }
				</div>

				<div className="thank-you__upsell-text">
					<h3 className="thank-you__upsell-title">{ title }</h3>
					<p className="thank-you__upsell-description">{ description }</p>
				</div>

				<div className="thank-you__upsell-actions">{ actions }</div>
			</div>
		</div>
	);
}
