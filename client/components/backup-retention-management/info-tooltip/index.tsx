import { Button, Gridicon, Tooltip } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useRef, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { STORAGE_RETENTION_LEARN_MORE_LINK } from '../constants';
import './style.scss';

const InfoToolTip: FunctionComponent = () => {
	const translate = useTranslate();
	const [ isTooltipVisible, setTooltipVisible ] = useState< boolean >( false );
	const tooltip = useRef< SVGSVGElement >( null );

	const dispatch = useDispatch();
	const toggleTooltip = useCallback(
		( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ): void => {
			if ( ! isTooltipVisible ) {
				dispatch(
					recordTracksEvent( 'calypso_jetpack_backup_storage_retention_tooltip_open_click' )
				);
			}

			setTooltipVisible( ! isTooltipVisible );
			// when the info tooltip inside a button, we don't want clicking it to propagate up
			event.stopPropagation();
		},
		[ dispatch, isTooltipVisible ]
	);

	const closeTooltip = () => {
		setTooltipVisible( false );
	};

	const onLearnMoreClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_retention_tooltip_learn_more_click' )
		);
	}, [ dispatch ] );

	return (
		<div className="retention-setting-info-tooltip">
			<Button
				borderless
				className="retention-setting-info-tooltip__toggle-tooltip"
				onClick={ toggleTooltip }
			>
				<Gridicon ref={ tooltip } icon="info-outline" />
			</Button>
			<Tooltip
				className="retention-setting-info-tooltip__tooltip"
				isVisible={ isTooltipVisible }
				position="right"
				context={ tooltip.current }
				showOnMobile
			>
				<p>
					{ translate(
						'You can manage the storage used by changing how many days of backups will be saved.'
					) }
					<Button
						borderless
						compact
						className="retention-setting-info-tooltip__close-tooltip"
						onClick={ closeTooltip }
					>
						<Gridicon icon="cross" size={ 18 } />
					</Button>
				</p>
				<hr />
				<ExternalLink href={ STORAGE_RETENTION_LEARN_MORE_LINK } onClick={ onLearnMoreClick }>
					{ translate( 'Learn more' ) }
				</ExternalLink>
			</Tooltip>
		</div>
	);
};

export default InfoToolTip;
