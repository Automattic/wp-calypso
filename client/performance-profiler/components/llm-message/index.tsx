import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import AIIcon from 'calypso/assets/images/performance-profiler/ai-icon.svg';
import AILoadingIcon from 'calypso/assets/images/performance-profiler/ai-loading-icon.svg';

import './style.scss';

interface LLMMessageProps {
	message: string | ReactNode;
	secondaryArea?: ReactNode;
	rotate?: boolean;
}

export const LLMMessage = ( { message, rotate, secondaryArea }: LLMMessageProps ) => {
	const translate = useTranslate();

	return (
		<div className="performance-profiler-llm-message">
			<div className="content">
				<img
					src={ rotate ? AILoadingIcon : AIIcon }
					alt={ translate( 'AI generated content icon' ) }
					className={ clsx( { rotate: !! rotate } ) }
				/>
				<span className="message">{ message }</span>
			</div>
			{ secondaryArea }
		</div>
	);
};
