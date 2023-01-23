import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import Tooltip from 'calypso/components/tooltip';
import { convertBytesToUnitAmount, StorageUnits } from './hooks';

type OwnProps = {
	className?: string;
	bytesAvailable: number | undefined;
};
const StorageHelpTooltip: React.FC< OwnProps > = ( { className, bytesAvailable } ) => {
	const translate = useTranslate();
	const [ isTooltipVisible, setTooltipVisible ] = React.useState< boolean >( false );
	const tooltip = React.useRef< SVGSVGElement >( null );

	if ( undefined === bytesAvailable ) {
		return null;
	}

	const { unitAmount: availableUnitAmount, unit: availableUnit } =
		convertBytesToUnitAmount( bytesAvailable );

	const toggleHelpTooltip = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ): void => {
		setTooltipVisible( ! isTooltipVisible );
		// when the info tooltip inside a button, we don't want clicking it to propagate up
		event.stopPropagation();
	};
	const closeHelpTooltip = () => {
		setTooltipVisible( false );
	};

	return (
		<span className={ className }>
			<Button
				borderless
				className="storage-usage-help-tooltip__toggle-tooltip"
				onClick={ toggleHelpTooltip }
			>
				<Gridicon ref={ tooltip } icon="info-outline" size={ 24 } />
			</Button>
			<Tooltip
				className="storage-usage-help-tooltip__tooltip"
				isVisible={ isTooltipVisible }
				position="right"
				context={ tooltip.current }
				showOnMobile
			>
				<p>
					{ translate(
						'We store your backups on our cloud storage. Your total storage size is %(availableUnitAmount)d%(unit)s.',
						{
							args: {
								availableUnitAmount,
								unit: StorageUnits.Gigabyte === availableUnit ? 'GB' : 'TB',
							},
							comment:
								'Describes available storage amounts (e.g., We store your backups on our cloud storage. Your total storage size is 20GB)',
						}
					) }
					<Button
						borderless
						compact
						className="storage-usage-help-tooltip__close-tooltip"
						onClick={ closeHelpTooltip }
					>
						<Gridicon icon="cross" size={ 18 } />
					</Button>
				</p>
				<hr />
				{ translate( '{{a}}Learn more…{{/a}}', {
					components: {
						a: (
							<a
								href="https://jetpack.com/support/backup/#how-is-storage-usage-calculated"
								target="_blank"
								rel="external noreferrer noopener"
							/>
						),
					},
				} ) }
			</Tooltip>
		</span>
	);
};

export default StorageHelpTooltip;
