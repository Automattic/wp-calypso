import classNames from 'classnames';
import type { Pattern } from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternPreviewPlaceholderProps = {
	className?: string;
	pattern: Pattern | null;
};

export function PatternPreviewPlaceholder( {
	className,
	pattern,
}: PatternPreviewPlaceholderProps ) {
	return (
		<div
			className={ classNames( 'pattern-preview is-loading', className ) }
			id={ `pattern-${ pattern?.ID }` }
		>
			<div className="pattern-preview__renderer" />

			<div className="pattern-preview__header">
				<div className="pattern-preview__title">{ pattern?.title }</div>
			</div>
		</div>
	);
}
