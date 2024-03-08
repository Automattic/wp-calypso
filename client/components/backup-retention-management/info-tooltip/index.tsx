import { Button, Gridicon, Tooltip } from '@automattic/components';
import { useRef, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { STORAGE_RETENTION_LEARN_MORE_LINK } from '../constants';
import './style.scss';

const InfoToolTip: FunctionComponent = () => {
	const translate = useTranslate();
	const [ isTooltipVisible, setTooltipVisible ] = useState< boolean >( false );
	const tooltip = useRef< SVGSVGElement >( null );

	const toggleTooltip = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ): void => {
		setTooltipVisible( ! isTooltipVisible );
		// when the info tooltip inside a button, we don't want clicking it to propagate up
		event.stopPropagation();
	};

	const closeTooltip = () => {
		setTooltipVisible( false );
	};

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
				{ translate( '{{a}}Learn more…{{/a}}', {
					components: {
						a: (
							<a
								href={ STORAGE_RETENTION_LEARN_MORE_LINK }
								target="_blank"
								rel="external noreferrer noopener"
							/>
						),
					},
				} ) }
			</Tooltip>
		</div>
	);
};

export default InfoToolTip;
