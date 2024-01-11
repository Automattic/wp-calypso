import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { isOutsideCalypso } from 'calypso/lib/url';

import './style.scss';

export type ThankYouFooterDetailProps = {
	key: string;
	title?: string;
	description?: string;
	buttonText?: string;
	buttonHref?: string;
	buttonOnClick?: () => void;
};

const ThankYouFooterDetail = ( {
	title,
	description,
	buttonText,
	buttonHref,
	buttonOnClick,
}: ThankYouFooterDetailProps ) => {
	let button = null;

	if ( buttonText && buttonHref && buttonOnClick ) {
		const isExternal = isOutsideCalypso( buttonHref );
		button = (
			<Button
				className="thank-you__footer-detail-button"
				href={ localizeUrl( buttonHref ) }
				onClick={ buttonOnClick }
				target={ isExternal ? '_blank' : '_self' }
				rel={ isExternal ? 'noreferrer noopener' : '' }
			>
				{ buttonText }
			</Button>
		);
	}

	return (
		<div className="thank-you__footer-detail">
			{ title && <h3 className="thank-you__footer-detail-title">{ title }</h3> }

			{ description && <div className="thank-you__footer-detail-description">{ description }</div> }

			{ button }
		</div>
	);
};

type ThankYouFooterProps = {
	details: ThankYouFooterDetailProps[];
};

export default function ThankYouFooter( { details }: ThankYouFooterProps ) {
	return (
		<div className="thank-you__footer">
			<div className="thank-you__footer-inner">
				{ details.map( ( detailsProps ) => (
					<ThankYouFooterDetail { ...detailsProps } />
				) ) }
			</div>
		</div>
	);
}
