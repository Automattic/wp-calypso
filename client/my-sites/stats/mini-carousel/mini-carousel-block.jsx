import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import page from 'page';
import { useCallback } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';

import './mini-carousel-block.scss';

const MiniCarouselBlock = ( { clickEvent, contentText, ctaText, headerText, href, image } ) => {
	const onClick = useCallback( () => {
		recordTracksEvent( clickEvent );
		page( href );
	}, [ clickEvent, href ] );

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
		</div>
	);
};

export default MiniCarouselBlock;
