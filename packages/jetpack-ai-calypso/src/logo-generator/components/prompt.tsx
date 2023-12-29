/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { Icon, info } from '@wordpress/icons';
import { useState } from 'react';
/**
 * Internal dependencies
 */
import AiIcon from '../assets/icons/ai';
import { STORE_NAME } from '../store';
import './prompt.scss';

export const Prompt: React.FC = () => {
	const { addLogoToHistory } = useDispatch( STORE_NAME );
	const [ count, setCount ] = useState( 0 );

	const onClick = () => {
		// TODO: Change to actual generated logo
		const sampleLogo = {
			url: `https://s.w.org/style/images/about/WordPress-logotype-wmark.png?count=${ count }`,
			description: 'The WordPress logo',
		};
		setCount( count + 1 );

		addLogoToHistory( sampleLogo );
	};

	return (
		<div className="jetpack-ai-logo-generator__prompt">
			<div className="jetpack-ai-logo-generator__prompt-header">
				<div className="jetpack-ai-logo-generator__prompt-label">Describe your site/logo:</div>
				<div className="jetpack-ai-logo-generator__prompt-actions">
					<Button variant="link">
						<AiIcon />
						Enhance prompt
					</Button>
				</div>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-query">
				{ /* TODO: textarea doesn't resize, either import from block-editor or use custom contentEditable */ }
				<textarea
					className="prompt-query__input"
					placeholder="describe your site or simply ask for a logo specifying some details about it"
				></textarea>
				<Button
					variant="primary"
					className="jetpack-ai-logo-generator__prompt-submit"
					onClick={ onClick }
				>
					Generate
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-footer">
				<div>18 requests remaining.</div>&nbsp;
				<a href="https://automattic.com/ai-guidelines">Upgrade</a>
				<Icon className="prompt-footer__icon" icon={ info } />
			</div>
		</div>
	);
};
