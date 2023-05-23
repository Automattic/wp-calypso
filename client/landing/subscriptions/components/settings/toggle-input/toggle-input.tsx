import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import './styles.scss';

type ToggleInputProps = {
	checked: boolean;
	onChange: ( checked: boolean ) => void;
	label: string;
	hint?: string;
	loading?: boolean;
};

const ToggleInput = ( { checked, onChange, label, hint, loading }: ToggleInputProps ) => {
	return (
		<div className="toggle-input">
			<ToggleControl
				className={ classNames( 'toggle-input__control', { 'is-loading': loading } ) }
				onChange={ onChange }
				checked={ checked }
				label={ label }
			/>
			{ hint && <p className="toggle-input__hint">{ hint }</p> }
		</div>
	);
};

export default ToggleInput;
