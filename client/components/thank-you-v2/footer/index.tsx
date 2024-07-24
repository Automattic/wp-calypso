import { Button } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';
import clsx from 'clsx';
import { isOutsideCalypso } from 'calypso/lib/url';

import './style.scss';

export type ThankYouFooterDetailProps = {
	key: string;
	title?: string;
	description?: string;
	buttonText?: string;
	buttonHref?: string;
	buttonOnClick?: () => void;
	supportDoc?: { url: string; id: number };
	showHelpCenterOnClick?: boolean;
};

const HELP_CENTER_STORE = HelpCenter.register();

const ThankYouFooterDetail = ( {
	title,
	description,
	buttonText,
	buttonHref,
	buttonOnClick,
	supportDoc,
	showHelpCenterOnClick,
}: ThankYouFooterDetailProps ) => {
	let button = null;

	const { setShowHelpCenter, setShowSupportDoc } = useDispatch( HELP_CENTER_STORE );
	const SUPPORT_SITE_ID = 9619154;

	const onClick = () => {
		if ( supportDoc ) {
			setShowSupportDoc( supportDoc.url, supportDoc.id, SUPPORT_SITE_ID );
		} else if ( showHelpCenterOnClick ) {
			setShowHelpCenter( true );
		}

		buttonOnClick?.();
	};

	if ( buttonText && ( buttonHref || buttonOnClick || supportDoc || showHelpCenterOnClick) ) {
		const isExternal = buttonHref && isOutsideCalypso( buttonHref );
		button = (
			<Button
				className="thank-you__footer-detail-button"
				href={ buttonHref && localizeUrl( buttonHref ) }
				onClick={ onClick }
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
		<div
			className={ clsx( 'thank-you__footer', {
				'has-multiple-details': details && details.length > 1,
			} ) }
		>
			<div className="thank-you__footer-inner">
				{ details.map( ( detailsProps ) => (
					<ThankYouFooterDetail { ...detailsProps } />
				) ) }
			</div>
		</div>
	);
}
