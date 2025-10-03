import { Button, Gridicon, Popover } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';

type OwnProps = {
	className?: string;
	storageUpgradeUrl: string;
	forecastInDays: number | undefined;
	onClickedPurchase: () => void;
};
const StorageHelpPopover: React.FC< OwnProps > = ( {
	className,
	storageUpgradeUrl,
	forecastInDays,
	onClickedPurchase,
} ) => {
	const translate = useTranslate();
	const STORAGE_USAGE_HELP_POPOVER_STATE_KEY = 'storage_usage_help_popover_state';
	const popoverState = null === localStorage.getItem( STORAGE_USAGE_HELP_POPOVER_STATE_KEY );
	const [ isPopoverVisible, setPopoverVisible ] = useState< boolean >( popoverState );
	const popover = useRef< SVGSVGElement >( null );

	if ( ! forecastInDays ) {
		return null;
	}

	const toggleHelpPopover = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ): void => {
		setPopoverVisible( ! isPopoverVisible );
		localStorage.setItem( STORAGE_USAGE_HELP_POPOVER_STATE_KEY, 'shown' );
		// when the info popover inside a button, we don't want clicking it to propagate up
		event.stopPropagation();
	};

	return (
		<span className={ className }>
			<Button
				borderless
				compact
				className="storage-usage-help-popover__toggle-popover"
				onClick={ toggleHelpPopover }
			>
				<Gridicon ref={ popover } icon="info-outline" size={ 18 } />
			</Button>
			<Popover
				className="storage-usage-help-popover__popover"
				isVisible={ isPopoverVisible }
				position="bottom right"
				context={ popover.current }
				showOnMobile
			>
				<h3> { translate( 'Backup archive size' ) }</h3>
				<p>
					{ translate(
						'Based on the current size of your site, Jetpack will save up to {{strong}}%(forecastInDays)d full backup{{/strong}}.',
						'Based on the current size of your site, Jetpack will save up to {{strong}}%(forecastInDays)d days of full backups{{/strong}}.',
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
						className="storage-usage-help-popover__close-popover"
						onClick={ toggleHelpPopover }
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
				<div className="storage-usage-help-popover__button-section">
					<Button primary href={ storageUpgradeUrl } onClick={ onClickedPurchase }>
						{ translate( 'Add more storage' ) }
					</Button>
				</div>
			</Popover>
		</span>
	);
};

export default StorageHelpPopover;
