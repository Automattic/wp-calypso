import { Button } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useStorageStatusText from './use-storage-status-text';
import type { StorageUsageLevelName } from '../storage-usage-levels';

type OwnProps = {
	className?: string;
	usageLevel: StorageUsageLevelName;
	href?: string;
	upsellSlug: SelectorProduct | null;
	storage: React.ReactChild;
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
			className={ classnames( className, 'usage-warning__action-button', {
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
