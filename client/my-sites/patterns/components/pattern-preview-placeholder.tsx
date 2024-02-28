import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

import './pattern-preview.scss';

type Props = { pattern: Pattern };

export function PatternPreviewPlaceholder( { pattern }: Props ) {
	return (
		<div className="pattern-preview pattern-preview_loading">
			<div className="pattern-preview__renderer" />
			<div className="pattern-preview__title">{ pattern.title }</div>
		</div>
	);
}
