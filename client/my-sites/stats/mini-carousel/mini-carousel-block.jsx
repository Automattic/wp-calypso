import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { dismissBlock } from './actions';

import './mini-carousel-block.scss';

const MiniCarouselBlock = ( {
	clickEvent,
	contentText,
	ctaText,
	headerText,
	href,
	image,
	dismissEvent,
	dismissText,
} ) => {
	const dispatch = useDispatch();
	const hostname = config( 'hostname' );
	const isWpcomDomain = typeof window !== 'undefined' && window.location.hostname === hostname;

	const onClick = useCallback( () => {
		const isHrefRelative = href.startsWith( '/' );
		recordTracksEvent( clickEvent );

		// Use Calypso router when the page is under a WPCOM domain.
		if ( isWpcomDomain && isHrefRelative ) {
			page( href );
			return;
		}

		// Otherwise, use the browser API to navigate to the href.
		location.href = isHrefRelative ? `${ hostname }${ href }` : href;
	}, [ clickEvent, href, hostname, isWpcomDomain ] );

	const onDismiss = useCallback( () => {
		recordTracksEvent( dismissEvent );
		dispatch( dismissBlock( dismissEvent ) );
	}, [ dismissEvent, dispatch ] );

	return (
		<div className="mini-carousel-block">
			{ image }
			<div className="mini-carousel-block__content">
				<FormattedHeader
					headerText={ headerText }
					align="left"
					className="mini-carousel-block__header-text"
				/>
				<p className="mini-carousel-block__content-text">{ contentText }</p>
			</div>
			<Button primary onClick={ onClick }>
				{ ctaText }
			</Button>
			{ dismissEvent && (
				<Button onClick={ onDismiss } className="mini-carousel-block__close-button">
					{ dismissText ? dismissText : translate( 'Hide this' ) }
					<Icon
						className="mini-carousel-block__close-button-icon"
						icon={ chevronDown }
						size={ 18 }
					/>
				</Button>
			) }
		</div>
	);
};

export default MiniCarouselBlock;
