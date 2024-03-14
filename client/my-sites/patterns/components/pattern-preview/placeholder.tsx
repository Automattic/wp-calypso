import type { Pattern } from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternPreviewPlaceholderProps = { pattern: Pattern | null };

export function PatternPreviewPlaceholder( { pattern }: PatternPreviewPlaceholderProps ) {
	return (
		<div className="pattern-preview is-loading">
			<div className="pattern-preview__renderer" />
			<div className="pattern-preview__title">{ pattern?.title }</div>
		</div>
	);
}
