import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { StorageUsageLevelName } from 'calypso/state/rewind/storage/types';
import useStorageStatusText from './use-storage-status-text';

type OwnProps = {
	className?: string;
	usageLevel: StorageUsageLevelName;
	href?: string;
	upsellSlug: SelectorProduct | null;
	storage: TranslateResult;
	onClick?: React.MouseEventHandler;
	price: JSX.Element;
	daysOfBackupsSaved: number;
	minDaysOfBackupsAllowed: number;
};

const ActionButton: React.FC< OwnProps > = ( {
	className,
	usageLevel,
	href,
	storage,
	onClick,
	price,
	daysOfBackupsSaved,
	minDaysOfBackupsAllowed,
} ) => {
	const storageStatusText = useStorageStatusText(
		usageLevel,
		daysOfBackupsSaved,
		minDaysOfBackupsAllowed
	);

	const hasClickableAction = Boolean( href || onClick );
	const translate = useTranslate();

	return (
		<Button
			className={ clsx( className, 'usage-warning__action-button', {
				'has-clickable-action': hasClickableAction,
			} ) }
			href={ href }
			onClick={ onClick }
		>
			<div className="action-button__copy">
				<div className="action-button__status">{ storageStatusText }</div>
				<div className="action-button__action-text">
					{ translate( 'Add %(storage)s additional storage for {{price/}}', {
						components: { price: price },
						args: { storage },
					} ) }
				</div>
			</div>
			{ hasClickableAction && <span className="action-button__arrow">&#8594;</span> }
		</Button>
	);
};

export default ActionButton;
