import type { Pattern } from 'calypso/my-sites/patterns/types';

import './pattern-preview.scss';

type PatternPreviewPlaceholderProps = { pattern: Pattern };

export function PatternPreviewPlaceholder( { pattern }: PatternPreviewPlaceholderProps ) {
	return (
		<div className="pattern-preview is-loading">
			<div className="pattern-preview__renderer" />
			<div className="pattern-preview__title">{ pattern.title }</div>
		</div>
	);
}
