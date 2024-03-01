import type { Pattern } from 'calypso/my-sites/patterns/types';

import './pattern-preview.scss';

type Props = { pattern: Pattern };

export function PatternPreviewPlaceholder( { pattern }: Props ) {
	return (
		<div className="pattern-preview is-loading">
			<div className="pattern-preview__renderer" />
			<div className="pattern-preview__title">{ pattern.title }</div>
		</div>
	);
}
