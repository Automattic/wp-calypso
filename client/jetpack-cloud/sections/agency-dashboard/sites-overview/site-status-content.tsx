import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { ReactElement, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Badge from 'calypso/components/badge';
import Tooltip from 'calypso/components/tooltip';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SiteSetFavorite from './site-set-favorite';
import { getRowMetaData } from './utils';
import type { AllowedTypes, SiteData } from './types';

interface Props {
	rows: SiteData;
	type: AllowedTypes;
	isLargeScreen?: boolean;
	isFavorite?: boolean;
}

export default function SiteStatusContent( {
	rows,
	type,
	isLargeScreen = false,
	isFavorite = false,
}: Props ): ReactElement {
	const dispatch = useDispatch();

	const {
		link,
		isExternalLink,
		row: { value, status, error },
		siteError,
		tooltip,
		tooltipId,
		siteDown,
		eventName,
	} = getRowMetaData( rows, type, isLargeScreen );

	// Disable clicks/hover when there is a site error &
	// when the row it is not monitor and monitor status is down
	// since monitor is clickable when site is down.
	const disabledStatus = siteError || ( type !== 'monitor' && siteDown );

	const statusContentRef = useRef< HTMLSpanElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	const handleClickRowAction = () => {
		dispatch( recordTracksEvent( eventName ) );
	};

	if ( type === 'site' ) {
		// Site issues is the sum of scan threats and plugin updates
		let siteIssuesCount = rows.scan.threats + rows.plugin.updates;
		let isHighSeverityError = !! rows.scan.threats;
		if ( [ 'failed', 'warning' ].includes( rows.backup.status ) ) {
			siteIssuesCount = siteIssuesCount + 1;
			isHighSeverityError = isHighSeverityError || 'failed' === rows.backup.status;
		}
		if ( [ 'failed' ].includes( rows.monitor.status ) ) {
			siteIssuesCount = siteIssuesCount + 1;
			isHighSeverityError = true;
		}
		let errorContent;
		if ( error ) {
			errorContent = (
				<span className="sites-overview__status-critical">
					<Gridicon size={ 24 } icon="notice-outline" />
				</span>
			);
		} else if ( siteIssuesCount ) {
			errorContent = (
				<span
					className={ classNames(
						'sites-overview__status-count',
						isHighSeverityError ? 'sites-overview__status-failed' : 'sites-overview__status-warning'
					) }
				>
					{ siteIssuesCount }
				</span>
			);
		}

		return (
			<>
				<SiteSetFavorite
					isFavorite={ isFavorite }
					siteId={ rows.site.value.blog_id }
					siteUrl={ rows.site.value.url }
				/>
				<span className="sites-overview__row-text">{ value.url }</span>
				<span className="sites-overview__overlay"></span>
				{ errorContent }
			</>
		);
	}

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
		case 'disabled': {
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
		let target = '_self';
		let rel;
		if ( isExternalLink ) {
			target = '_blank';
			rel = 'noreferrer';
		}
		updatedContent = (
			<a
				data-testid={ `row-${ tooltipId }` }
				target={ target }
				rel={ rel }
				onClick={ handleClickRowAction }
				href={ link }
			>
				{ content }
			</a>
		);
	}

	if ( disabledStatus ) {
		updatedContent = <span className="sites-overview__disabled">{ content } </span>;
	}

	return (
		<>
			{ tooltip && ! disabledStatus ? (
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
