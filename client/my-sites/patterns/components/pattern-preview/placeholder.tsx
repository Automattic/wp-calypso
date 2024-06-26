import { Button } from '@automattic/components';
import { useResizeObserver } from '@wordpress/compose';
import { Icon, copy } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type PatternPreviewPlaceholderProps = {
	className?: string;
	title?: string;
};

export function PatternPreviewPlaceholder( { className, title }: PatternPreviewPlaceholderProps ) {
	const translate = useTranslate();
	const [ resizeObserver, nodeSize ] = useResizeObserver();

	const isPreviewLarge = nodeSize?.width ? nodeSize.width > 960 : true;

	const copyButtonText = isPreviewLarge
		? translate( 'Copy pattern', {
				comment: 'Button label for copying a pattern',
				textOnly: true,
		  } )
		: translate( 'Copy', {
				comment: 'Button label for copying a pattern',
				textOnly: true,
		  } );

	return (
		<div
			className={ clsx( 'pattern-preview is-loading', className, {
				'is-server': typeof window !== 'undefined',
			} ) }
		>
			{ resizeObserver }

			<div className="pattern-preview__renderer" />

			<div className="pattern-preview__header">
				<div className="pattern-preview__title">{ title }</div>

				<Button className="pattern-preview__copy is-placeholder" primary>
					<Icon height={ 18 } icon={ copy } width={ 18 } /> { copyButtonText }
				</Button>
			</div>
		</div>
	);
}
