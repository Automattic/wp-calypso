import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { ReactElement, useRef, useState } from 'react';
import Badge from 'calypso/components/badge';
import Tooltip from 'calypso/components/tooltip';
import { getRowMetaData } from './utils';

interface Props {
	rows: object;
	type: string;
}

export default function SiteStatusContent( { rows, type }: Props ): ReactElement {
	const {
		link,
		row: { value, status },
		siteError,
		tooltip,
		tooltipId,
	} = getRowMetaData( rows, type );

	const statusContentRef = useRef< HTMLSpanElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	const handleClickRowAction = () => {
		// Handle track event here
	};

	let content;

	switch ( status ) {
		case 'failed': {
			content = (
				<Badge className="sites-overview__badge" type="error">
					{ value }
				</Badge>
			);
			break;
		}
		case 'warning': {
			content = (
				<Badge className="sites-overview__badge" type="warning">
					{ value }
				</Badge>
			);
			break;
		}
		case 'success': {
			content = <Gridicon icon="checkmark" size={ 18 } className="sites-overview__grey-icon" />;
			break;
		}
		case 'active': {
			content = <Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />;
			break;
		}
		case 'progress': {
			content = <Gridicon icon="time" size={ 18 } className="sites-overview__grey-icon" />;
			break;
		}
		case 'inactive': {
			content = (
				<span className="sites-overview__status-add-new">
					<Gridicon icon="plus-small" size={ 16 } />
					<span>{ translate( 'Add' ) }</span>
				</span>
			);
			break;
		}
	}

	let updatedContent = content;

	if ( link ) {
		updatedContent = (
			<a onClick={ handleClickRowAction } href={ link }>
				{ content }
			</a>
		);
	}

	if ( siteError ) {
		updatedContent = <span className="sites-overview__disabled">{ content } </span>;
	}

	return (
		<>
			{ tooltip && ! siteError ? (
				<>
					<span
						ref={ statusContentRef }
						onMouseEnter={ handleShowTooltip }
						onMouseLeave={ handleHideTooltip }
					>
						{ updatedContent }
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
			) : (
				updatedContent
			) }
		</>
	);
}
