import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';

interface RetentionOptionCardProps {
	spaceNeededInBytes: number;
	upgradeRequired: boolean;
	isCurrentPlan: boolean;
	value: RetentionPeriod;
	checked?: boolean;
	onChange: ( value: number ) => void;
}

const RetentionOptionCard: FunctionComponent< RetentionOptionCardProps > = ( {
	spaceNeededInBytes,
	upgradeRequired,
	isCurrentPlan,
	value,
	checked = false,
	onChange,
} ) => {
	const translate = useTranslate();

	const handleOptionClick = () => {
		onChange( value );
	};

	const spaceNeededText = useStorageText( spaceNeededInBytes );

	const RETENTION_OPTIONS_LABELS: Record< RetentionPeriod, TranslateResult > = {
		[ 7 ]: translate( '7 days' ),
		[ 30 ]: translate( '30 days' ),
		[ 120 ]: translate( '120 days' ),
		[ 365 ]: translate( '1 year' ),
	};

	return (
		<div
			className="retention-option"
			role="radio"
			aria-checked={ checked }
			onClick={ handleOptionClick }
			onKeyDown={ handleOptionClick }
			tabIndex={ 0 }
		>
			<div className="retention-option__headline">
				<div className="headline__label">{ RETENTION_OPTIONS_LABELS[ value ] }</div>
				<input
					className="components-radio-control__input"
					type="radio"
					name="storage_option"
					value={ value }
					checked={ checked }
					onChange={ ( event ) => {
						onChange( Number( event.target.value ) );
					} }
				/>
			</div>
			<div className="retention-option__space-needed">
				<div className="space-needed__label">{ translate( 'Space needed:' ) }</div>
				<div className="space-needed__value">{ spaceNeededText }</div>
			</div>
			<div
				className={ clsx( 'retention-option__upgrade-required', {
					'is-visible': upgradeRequired,
				} ) }
			>
				{ translate( 'Upgrade required' ) }
			</div>
			<div
				className={ clsx( 'retention-option__current-plan', {
					'is-visible': isCurrentPlan,
				} ) }
			>
				{ translate( 'Current plan' ) }
			</div>
		</div>
	);
};

export default RetentionOptionCard;
