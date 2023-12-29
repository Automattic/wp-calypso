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
						<svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.33301 5.33325L10.4644 8.20188L13.333 9.33325L10.4644 10.4646L9.33301 13.3333L8.20164 10.4646L5.33301 9.33325L8.20164 8.20188L9.33301 5.33325Z" />
							<path d="M21.3333 5.33333L22.8418 9.15817L26.6667 10.6667L22.8418 12.1752L21.3333 16L19.8248 12.1752L16 10.6667L19.8248 9.15817L21.3333 5.33333Z" />
							<path d="M14.6667 13.3333L16.5523 18.1144L21.3333 20L16.5523 21.8856L14.6667 26.6667L12.781 21.8856L8 20L12.781 18.1144L14.6667 13.3333Z" />
						</svg>
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
