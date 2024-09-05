import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import IAIcon from 'calypso/assets/images/performance-profiler/ia-icon.svg';

import './style.scss';

interface LLMMessageProps {
	message: string;
	rotate?: boolean;
}

export const LLMMessage = ( { message, rotate }: LLMMessageProps ) => {
	const translate = useTranslate();

	return (
		<div className="performance-profiler-llm-message">
			<div className="content">
				<img
					src={ IAIcon }
					alt={ translate( 'IA generated content icon' ) }
					className={ clsx( { rotate: !! rotate } ) }
				/>
				<span className="message">{ message }</span>
			</div>
		</div>
	);
};
