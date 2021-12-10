import React from 'react';
import './style.scss';
import FoldableCard from 'calypso/components/foldable-card';
import { AccordionProps } from './types';

const Accordion = ( {
	title,
	subtitle,
	children,
	expanded = false,
}: AccordionProps ): JSX.Element => {
	const renderHeader = () => {
		return (
			<div>
				<p className="accordion__title">{ title }</p>
				{ subtitle && <p className="accordion__subtitle">{ subtitle }</p> }
			</div>
		);
	};
	return (
		<div className="accordion">
			<FoldableCard header={ renderHeader() } expanded={ expanded }>
				{ children }
			</FoldableCard>
		</div>
	);
};

export default Accordion;
