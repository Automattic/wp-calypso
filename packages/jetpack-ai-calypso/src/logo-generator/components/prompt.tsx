/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
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
					<Button variant="link">Enhance prompt</Button>
				</div>
			</div>
			<div className="jetpack-ai-logo-generator__prompt-query">
				<textarea placeholder="describe your site or simply ask for a logo specifying some details about it"></textarea>
				<Button className="jetpack-ai-logo-generator__prompt-submit" onClick={ onClick }>
					Generate
				</Button>
			</div>
		</div>
	);
};
