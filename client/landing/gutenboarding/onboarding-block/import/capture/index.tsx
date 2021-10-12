import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import './style.scss';

const CaptureStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="capture__content">
			<input
				className="capture__input"
				autoComplete="off"
				autoCorrect="off"
				spellCheck="false"
				placeholder={ __( 'Enter your site address' ) }
			/>
		</div>
	);
};

export default CaptureStep;
