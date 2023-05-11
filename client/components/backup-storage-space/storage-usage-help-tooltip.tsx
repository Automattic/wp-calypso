import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import Tooltip from 'calypso/components/tooltip';

type OwnProps = {
	className?: string;
	storageUpgradeUrl: string;
	forecastInDays: number | undefined;
	onClickedPurchase: () => void;
};
const StorageHelpTooltip: React.FC< OwnProps > = ( {
	className,
	storageUpgradeUrl,
	forecastInDays,
	onClickedPurchase,
} ) => {
	const translate = useTranslate();
	const [ isTooltipVisible, setTooltipVisible ] = React.useState< boolean >( true );
	const tooltip = React.useRef< SVGSVGElement >( null );

	if ( ! forecastInDays ) {
		return null;
	}

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
				compact
				className="storage-usage-help-tooltip__toggle-tooltip"
				onClick={ toggleHelpTooltip }
			>
				<Gridicon ref={ tooltip } icon="info-outline" size={ 18 } />
			</Button>
			<Tooltip
				className="storage-usage-help-tooltip__tooltip"
				isVisible={ isTooltipVisible }
				position="bottom"
				context={ tooltip.current }
				showOnMobile
			>
				<h3> { translate( 'Backup archive size' ) }</h3>
				<p>
					{ translate(
						'Based on the current size of your site, Jetpack will save {{strong}}%(forecastInDays)d day of full backups{{/strong}}.',
						'Based on the current size of your site, Jetpack will save {{strong}}%(forecastInDays)d days of full backups{{/strong}}.',
						{
							components: { strong: <strong /> },
							count: forecastInDays,
							args: {
								forecastInDays,
							},
							comment:
								'Forecasts how many days of backups site can store based on current site size. %(forecastInDays)d is day count number',
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
				<p>
					{ translate(
						'If you need more backup days, try {{link}}reducing the backup size{{/link}} or adding more storage.',
						{
							components: {
								link: (
									<a
										href="https://jetpack.com/support/backup/jetpack-vaultpress-backup-storage-and-retention/#reduce-storage-size"
										target="_blank"
										rel="external noreferrer noopener"
									/>
								),
							},
						}
					) }
				</p>
				<div className="storage-usage-help-tooltip__button-section">
					<Button primary href={ storageUpgradeUrl } onClick={ onClickedPurchase }>
						{ translate( 'Add more storage' ) }
					</Button>
				</div>
			</Tooltip>
		</span>
	);
};

export default StorageHelpTooltip;
