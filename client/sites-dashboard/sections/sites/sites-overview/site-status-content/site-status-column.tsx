import { Gridicon, Tooltip } from '@automattic/components';
import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { AllowedTypes, RowMetaData, SiteData } from '../types';

type Props = {
	type: AllowedTypes;
	rows: SiteData;
	metadata: RowMetaData;
	disabled?: boolean;
};

export default function SiteStatusColumn( { metadata, disabled }: Props ) {
	const { link, isExternalLink, tooltipId, eventName, tooltip } = metadata;

	const dispatch = useDispatch();

	const handleClickRowAction = useCallback( () => {
		dispatch( recordTracksEvent( eventName ) );
	}, [ dispatch, eventName ] );

	const statusContentRef = useRef< HTMLSpanElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	const content = <Gridicon icon="checkmark" size={ 18 } className="sites-overview__grey-icon" />;

	let wrappedContent = content;

	if ( link ) {
		wrappedContent = (
			<a
				data-testid={ `row-${ tooltipId }` }
				target={ isExternalLink ? '_blank' : undefined }
				rel={ isExternalLink ? 'noreferrer' : undefined }
				onClick={ handleClickRowAction }
				href={ link }
			>
				{ content }
			</a>
		);
	}

	if ( disabled ) {
		wrappedContent = (
			<span className="sites-overview__disabled sites-overview__row-status">{ content }</span>
		);
	}

	if ( tooltip && ! disabled ) {
		return (
			<>
				<span
					ref={ statusContentRef }
					role="button"
					tabIndex={ 0 }
					onMouseEnter={ handleShowTooltip }
					onMouseLeave={ handleHideTooltip }
					onMouseDown={ handleHideTooltip }
					className="sites-overview__row-status"
				>
					{ wrappedContent }
				</span>
				<Tooltip
					id={ tooltipId }
					context={ statusContentRef.current }
					isVisible={ showTooltip }
					position="bottom"
					className="sites-overview__tooltip"
				>
					{ tooltip }
				</Tooltip>
			</>
		);
	}

	return <span className="sites-overview__row-status">{ wrappedContent }</span>;
}
