import classNames from 'classnames';

import './style.scss';

type PatternPreviewPlaceholderProps = {
	className?: string;
	title?: string;
};

export function PatternPreviewPlaceholder( { className, title }: PatternPreviewPlaceholderProps ) {
	return (
		<div className={ classNames( 'pattern-preview is-loading', className ) }>
			<div className="pattern-preview__renderer" />

			<div className="pattern-preview__header">
				<div className="pattern-preview__title">{ title }</div>
			</div>
		</div>
	);
}
