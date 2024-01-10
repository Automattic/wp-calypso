import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { isOutsideCalypso } from 'calypso/lib/url';

import './style.scss';

export type ThankYouDetailProps = {
	title?: string;
	description?: string;
	buttonText?: string;
	href?: string;
	clickEventName?: string;
	onClick?: () => void;
};

const ThankYouDetail = ( {
	title,
	description,
	buttonText,
	href,
	clickEventName,
}: ThankYouDetailProps ) => {
	const handleClick = () => {
		if ( ! clickEventName ) {
			return;
		}

		recordTracksEvent( clickEventName );
	};

	const isExternal = isOutsideCalypso( href ?? '' );

	return (
		<div className="thank-you__detail">
			{ title && <h3 className="thank-you__detail-title">{ title }</h3> }

			{ description && <div className="thank-you__detail-description">{ description }</div> }

			{ buttonText && href && (
				<Button
					className="thank-you__detail-button"
					href={ localizeUrl( href ) }
					onClick={ onClick ?? handleClick }
					target={ isExternal ? '_blank' : '_self' }
				>
					{ buttonText } { isExternal && <Gridicon icon="external" /> }
				</Button>
			) }
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
				{ footerDetails.map( ( detailsProps, index ) => (
					<ThankYouDetail { ...detailsProps } key={ 'detail' + index } />
				) ) }
			</div>
		</div>
	);
};

export default ThankYouFooter;
