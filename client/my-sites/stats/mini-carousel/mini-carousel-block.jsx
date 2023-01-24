import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import page from 'page';
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

	const onClick = useCallback( () => {
		recordTracksEvent( clickEvent );
		page( href );
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
