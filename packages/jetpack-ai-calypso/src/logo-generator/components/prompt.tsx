/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
/**
 * Internal dependencies
 */
import './prompt.scss';

export const Prompt: React.FC = () => {
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
				<Button className="jetpack-ai-logo-generator__prompt-submit">Generate</Button>
			</div>
		</div>
	);
};
