import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	const selectedSiteId = useSelector( getSelectedSiteId );

	const onClick = useCallback( () => {
		recordTracksEvent( clickEvent, { blog_id: selectedSiteId } );
		if ( href.startsWith( '/' ) ) {
			page( href );
			return;
		}

		location.href = href;
	}, [ clickEvent, href, selectedSiteId ] );

	const onDismiss = useCallback( () => {
		recordTracksEvent( dismissEvent, { blog_id: selectedSiteId } );
		dispatch( dismissBlock( dismissEvent ) );
	}, [ dismissEvent, dispatch, selectedSiteId ] );

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
