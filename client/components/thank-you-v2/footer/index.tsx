import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { isOutsideCalypso } from 'calypso/lib/url';

import './style.scss';

export type ThankYouDetailProps = {
	key: string;
	title?: string;
	description?: string;
	buttonText?: string;
	href?: string;
	onClick?: () => void;
};

const ThankYouDetail = ( {
	title,
	description,
	buttonText,
	href,
	onClick,
}: ThankYouDetailProps ) => {
	let button = null;

	if ( buttonText && href && onClick ) {
		const isExternal = isOutsideCalypso( href );
		button = (
			<Button
				className="thank-you__detail-button"
				href={ localizeUrl( href ) }
				onClick={ onClick }
				target={ isExternal ? '_blank' : '_self' }
				rel={ isExternal ? 'noreferrer noopener' : '' }
			>
				{ buttonText }
			</Button>
		);
	}

	return (
		<div className="thank-you__detail">
			{ title && <h3 className="thank-you__detail-title">{ title }</h3> }

			{ description && <div className="thank-you__detail-description">{ description }</div> }

			{ button }
		</div>
	);
};

type ThankYouFooterProps = {
	footerDetails: ThankYouDetailProps[];
};

const ThankYouFooter = ( { footerDetails }: ThankYouFooterProps ) => {
	return (
		<div className="thank-you__details-list">
			<div className="thank-you__details-list-inner">
				{ footerDetails.map( ( detailsProps ) => (
					<ThankYouDetail { ...detailsProps } />
				) ) }
			</div>
		</div>
	);
};

export default ThankYouFooter;
