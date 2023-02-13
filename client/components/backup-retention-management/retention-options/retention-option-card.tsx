import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import type { TranslateResult } from 'i18n-calypso';

interface RetentionOptionCardProps {
	label: string;
	spaceNeeded: TranslateResult | string;
	upgradeRequired: boolean;
	isCurrentPlan: boolean;
	value: number;
	checked?: boolean;
	onChange: ( value: number ) => void;
}

const RetentionOptionCard: FunctionComponent< RetentionOptionCardProps > = ( {
	label,
	spaceNeeded,
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
				<div className="headline__label">{ label }</div>
				<input
					className="headline__input components-radio-control__input"
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
				<div className="space-needed__value">{ spaceNeeded }</div>
			</div>
			<div
				className={ classnames( 'retention-option__upgrade-required', {
					'is-visible': upgradeRequired,
				} ) }
			>
				{ translate( 'Upgrade required' ) }
			</div>
			<div
				className={ classnames( 'retention-option__current-plan', {
					'is-visible': isCurrentPlan,
				} ) }
			>
				{ translate( 'Current plan' ) }
			</div>
		</div>
	);
};

export default RetentionOptionCard;
