import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { Card } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { RowArrows, useRowScroll } from './row-arrows';
import type { RowArrowLabels } from './row-arrows';
import type { ReactNode } from 'react';

import './accents.scss';
import './style.scss';

export interface ShowcaseItem {
	id: string;
	/** The maker's accent key: woo, jetpack or neutral (see accents.scss). */
	accent: string;
	eyebrow: string;
	glyph: JSX.Element;
	title: string;
	lockup?: { src: string; alt: string };
	/** A sentence on what it does; shown only where the words have a column of their own. */
	description?: string;
	meta?: ReactNode;
	art: ReactNode;
	action?: ReactNode;
	secondaryAction?: ReactNode;
}

export default function Showcase( {
	title,
	arrowLabels,
	items,
}: {
	title: string;
	arrowLabels: RowArrowLabels;
	items: ShowcaseItem[];
} ) {
	const { rowRef, canScroll, isInset, page } = useRowScroll< HTMLUListElement >();

	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				level={ 2 }
				title={ title }
				actions={ <RowArrows canScroll={ canScroll } page={ page } labels={ arrowLabels } /> }
			/>
			<ul
				ref={ rowRef }
				className={ clsx( 'dashboard-showcase', {
					'can-back': isInset && canScroll.back,
					'can-forward': isInset && canScroll.forward,
				} ) }
			>
				{ items.map( ( item, index ) => (
					<li key={ item.id } className="dashboard-showcase__item">
						<Card
							isBorderless
							className={ clsx( 'dashboard-showcase__tile', { 'is-lead': index === 0 } ) }
							data-accent={ item.accent }
						>
							<div className="dashboard-showcase__body">
								<VStack spacing={ 2 } alignment="topLeft" className="dashboard-showcase__text">
									<HStack
										spacing={ 2 }
										justify="flex-start"
										expanded={ false }
										className="dashboard-showcase__eyebrow"
									>
										<Icon className="dashboard-showcase__glyph" icon={ item.glyph } size={ 16 } />
										<Text
											size={ 11 }
											weight={ index === 0 ? 600 : 500 }
											lineHeight="16px"
											upperCase
											className="dashboard-showcase__eyebrow-label"
										>
											{ item.eyebrow }
										</Text>
									</HStack>
									{ item.lockup && (
										<img
											className="dashboard-showcase__lockup"
											src={ item.lockup.src }
											alt={ item.lockup.alt }
										/>
									) }
									<Text
										size={ index === 0 ? 24 : 20 }
										weight={ 600 }
										lineHeight={ 1.25 }
										className="dashboard-showcase__title"
									>
										{ item.title }
									</Text>
									{ item.description && (
										<Text
											size={ 15 }
											lineHeight="22px"
											truncate
											numberOfLines={ index === 0 ? 4 : 3 }
											className="dashboard-showcase__description"
										>
											{ item.description }
										</Text>
									) }
									{ item.meta && (
										<Text
											size={ 14 }
											lineHeight="20px"
											truncate
											numberOfLines={ 3 }
											className="dashboard-showcase__meta"
										>
											{ item.meta }
										</Text>
									) }
								</VStack>
								<div className="dashboard-showcase__art" aria-hidden="true">
									<div className="dashboard-showcase__object">{ item.art }</div>
								</div>
								{ item.action && (
									<HStack
										spacing={ 5 }
										justify="flex-start"
										expanded={ false }
										wrap
										className="dashboard-showcase__action"
									>
										{ item.action }
										{ item.secondaryAction }
									</HStack>
								) }
							</div>
						</Card>
					</li>
				) ) }
			</ul>
		</VStack>
	);
}
