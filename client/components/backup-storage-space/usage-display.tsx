import { Button, Gridicon, ProgressBar } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import Tooltip from 'calypso/components/tooltip';
import {
	getRewindBytesAvailable,
	getRewindBytesUsed,
	getRewindDaysOfBackupsSaved,
} from 'calypso/state/rewind/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { convertBytesToUnitAmount, StorageUnits, useStorageUsageText } from './hooks';
import { StorageUsageLevelName, StorageUsageLevels } from './storage-usage-levels';

const PROGRESS_BAR_CLASS_NAMES = {
	[ StorageUsageLevels.Full ]: 'full-warning',
	[ StorageUsageLevels.Critical ]: 'red-warning',
	[ StorageUsageLevels.Warning ]: 'yellow-warning',
	[ StorageUsageLevels.Normal ]: 'no-warning',
};

type OwnProps = {
	loading?: boolean;
	usageLevel: StorageUsageLevelName;
};

const UsageDisplay: React.FC< OwnProps > = ( { loading = false, usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	const translate = useTranslate();

	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const storageUsageText = useStorageUsageText( bytesUsed, bytesAvailable );
	const daysOfBackupsSaved =
		useSelector( ( state ) => getRewindDaysOfBackupsSaved( state, siteId ) ) || 0;

	const loadingText = translate( 'Calculating…', {
		comment: 'Loading text displayed while storage usage is being calculated',
	} );

	const [ isTooltipVisible, setTooltipVisible ] = React.useState< boolean >( false );
	const tooltip = React.useRef< SVGSVGElement >( null );

	const toggleHelpTooltip = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ): void => {
		setTooltipVisible( ! isTooltipVisible );
		// when the info tooltip inside a button, we don't want clicking it to propagate up
		event.stopPropagation();
	};
	const closeHelpTooltip = () => {
		setTooltipVisible( false );
	};
	const { unitAmount: availableUnitAmount, unit: availableUnit } = convertBytesToUnitAmount(
		bytesAvailable || 0
	);
	const daysOfBackupsSavedLinkTarget = `/activity-log/${ siteSlug }?group=rewind`;

	return (
		<div
			className={ classnames( 'backup-storage-space__progress-bar-container', {
				'is-loading': loading,
			} ) }
		>
			<div className="backup-storage-space__progress-heading">
				<span>{ translate( 'Cloud storage space' ) } </span>
				<Button
					borderless
					className="backup-storage-space__open-help-text-tooltip"
					onClick={ toggleHelpTooltip }
				>
					<Gridicon ref={ tooltip } icon="info-outline" size={ 24 } />
				</Button>
				<Tooltip
					className="backup-storage-space__help-text-tooltip"
					isVisible={ isTooltipVisible }
					position="right"
					context={ tooltip.current }
					showOnMobile
				>
					<div>
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
						<Button
							borderless
							compact
							className="backup-storage-space__close-help-text-tooltip"
							onClick={ closeHelpTooltip }
						>
							<Gridicon icon="cross" size={ 18 } />
						</Button>
					</div>
				</Tooltip>
			</div>
			<div className="backup-storage-space__progress-bar">
				<ProgressBar
					className={ PROGRESS_BAR_CLASS_NAMES[ usageLevel ] }
					value={ bytesUsed ?? 0 }
					total={ bytesAvailable ?? Infinity }
				/>
			</div>
			<div className="backup-storage-space__progress-usage-text">
				<div>{ loading ? loadingText : storageUsageText } </div>
				<div className="backups-saved__container">
					{ ! loading &&
						translate(
							'{{a}}%(daysOfBackupsSaved)d day of backup saved{{/a}}',
							'{{a}}%(daysOfBackupsSaved)d days of backups saved{{/a}}',
							{
								count: daysOfBackupsSaved,
								args: { daysOfBackupsSaved },
								components: {
									a: <a href={ daysOfBackupsSavedLinkTarget } />,
								},
							}
						) }
				</div>
			</div>
		</div>
	);
};

export default UsageDisplay;
