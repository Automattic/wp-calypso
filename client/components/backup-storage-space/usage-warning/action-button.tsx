import { Button } from '@wordpress/components';
import classnames from 'classnames';
import useStorageStatusText from './use-storage-status-text';
import type { StorageUsageLevelName } from '../storage-usage-levels';
import type { TranslateResult } from 'i18n-calypso';

type OwnProps = {
	className?: string;
	usageLevel: StorageUsageLevelName;
	actionText: TranslateResult;
	href?: string;
	onClick?: React.MouseEventHandler;
};

const ActionButton: React.FC< OwnProps > = ( {
	className,
	usageLevel,
	actionText,
	href,
	onClick,
} ) => {
	const storageStatusText = useStorageStatusText( usageLevel );

	const hasClickableAction = Boolean( href || onClick );

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
				<div className="action-button__action-text">{ actionText }</div>
			</div>
			{ hasClickableAction && <span className="action-button__arrow">&#8594;</span> }
		</Button>
	);
};

export default ActionButton;
