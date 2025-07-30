import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { forwardRef } from 'react';

import './featured.scss';

interface SkeletonProps {
	activeQuery: 'small' | 'large';
	className?: string;
	badges?: React.ReactNode;
	title: React.ReactNode;
	matchReasonsList?: React.ReactNode;
	price: React.ReactNode;
	cta: React.ReactNode;
}

export const FeaturedSkeleton = forwardRef< HTMLDivElement, SkeletonProps >( ( props, ref ) => {
	const { activeQuery, className, badges, title, matchReasonsList, price, cta } = props;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			if ( matchReasonsList ) {
				return (
					<HStack spacing={ 6 } className="domain-suggestion-featured__content">
						<VStack spacing={ 3 } style={ { justifyContent: 'flex-start', height: '100%' } }>
							{ badges }
							<VStack
								spacing={ 3 }
								alignment="left"
								style={ { alignSelf: 'stretch', justifyContent: 'flex-start' } }
							>
								{ title }
								{ matchReasonsList }
							</VStack>
						</VStack>
						<VStack
							spacing={ 6 }
							alignment="right"
							className="domain-suggestion-featured__price-info"
						>
							{ price }
							{ cta }
						</VStack>
					</HStack>
				);
			}

			return (
				<VStack spacing={ 3 } className="domain-suggestion-featured__content">
					<VStack spacing={ 3 } alignment="left">
						{ badges }
						{ title }
					</VStack>
					<HStack>
						{ price }
						{ cta }
					</HStack>
				</VStack>
			);
		}

		return (
			<VStack spacing={ 4 } className="domain-suggestion-featured__content--small">
				<VStack spacing={ 3 }>
					{ badges }
					{ title }
					{ price }
					{ matchReasonsList }
				</VStack>
				{ cta }
			</VStack>
		);
	};

	return (
		<Card ref={ ref } className={ clsx( 'domain-suggestion-featured', className ) }>
			<CardBody
				className="domain-suggestion-featured__body"
				style={ { padding: activeQuery === 'large' ? '1.5rem' : '1rem' } }
			>
				{ getContent() }
			</CardBody>
		</Card>
	);
} );

FeaturedSkeleton.displayName = 'FeaturedSkeleton';
