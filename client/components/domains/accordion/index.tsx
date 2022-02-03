/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
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
			<FoldableCard
				clickableHeader
				header={ renderHeader() }
				expanded={ expanded }
				disabled={ isPlaceholder }
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
			>
				{ children }
			</FoldableCard>
		</div>
	);
};

export default Accordion;
