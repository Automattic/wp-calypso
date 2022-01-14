import classNames from 'classnames';
import FoldableCard from 'calypso/components/foldable-card';
import type { AccordionProps } from './types';
import './style.scss';

const Accordion = ( {
	title,
	subtitle,
	children,
	isPlaceholder,
	expanded = false,
}: AccordionProps ): JSX.Element => {
	const classes = classNames( {
		'is-placeholder': isPlaceholder,
	} );
	const renderHeader = () => {
		return (
			<div>
				<p className={ classNames( 'accordion__title', classes ) }>{ title }</p>
				{ subtitle && (
					<p className={ classNames( 'accordion__subtitle', classes ) }>{ subtitle }</p>
				) }
			</div>
		);
	};
	return (
		<div className="accordion">
			<FoldableCard header={ renderHeader() } expanded={ expanded } disabled={ isPlaceholder }>
				{ children }
			</FoldableCard>
		</div>
	);
};

export default Accordion;
