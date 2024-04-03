import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { dismissBlock } from './actions';

import './mini-carousel-block.scss';

const debug = debugFactory( 'stats:mini-carousel' );

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

	const onClick = useCallback( () => {
		debug( 'onClick', { href } );

		recordTracksEvent( clickEvent );
		if ( href.startsWith( '/' ) ) {
			page( href );
			return;
		}

		location.href = href;
	}, [ clickEvent, href ] );

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
