/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FoldableCard } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import type { AccordionProps } from './types';
import './style.scss';

const Accordion = ( {
	title,
	subtitle,
	children,
	isPlaceholder,
	isDisabled,
	expanded = false,
	onClose,
	onOpen,
	className,
}: AccordionProps ) => {
	const classes = clsx( {
		'is-placeholder': isPlaceholder,
	} );
	const renderHeader = () => {
		return (
			<div>
				<p className={ clsx( 'accordion__title', classes ) }>{ title }</p>
				{ subtitle && <p className={ clsx( 'accordion__subtitle', classes ) }>{ subtitle }</p> }
			</div>
		);
	};
	return (
		<div className="accordion">
			<FoldableCard
				clickableHeader
				className={ className }
				header={ renderHeader() }
				expanded={ expanded }
				disabled={ isPlaceholder || isDisabled }
				actionButton={
					<button className="foldable-card__action foldable-card__expand">
						<span className="screen-reader-text">More</span>
						<Icon icon={ chevronDown } viewBox="6 4 12 14" size={ 16 } />
					</button>
				}
				actionButtonExpanded={
					<button className="foldable-card__action foldable-card__expand">
						<span className="screen-reader-text">More</span>
						<Icon icon={ chevronUp } viewBox="6 4 12 14" size={ 16 } />
					</button>
				}
				onClose={ onClose }
				onOpen={ onOpen }
			>
				{ children }
			</FoldableCard>
		</div>
	);
};

export default Accordion;
