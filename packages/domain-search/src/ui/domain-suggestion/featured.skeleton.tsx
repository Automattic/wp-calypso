import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { type ComponentProps, forwardRef } from 'react';

import './featured.scss';

interface SkeletonProps extends Omit< ComponentProps< typeof Card >, 'children' > {
	activeQuery: 'small' | 'large';
	className?: string;
	badges?: React.ReactNode;
	domainName: React.ReactNode;
	matchReasonsList?: React.ReactNode;
	price: React.ReactNode;
	cta: React.ReactNode;
	isSingleFeaturedSuggestion?: boolean;
}

export const FeaturedSkeleton = forwardRef< HTMLDivElement, SkeletonProps >( ( props, ref ) => {
	const {
		activeQuery,
		className,
		badges,
		domainName,
		matchReasonsList,
		price,
		cta,
		isSingleFeaturedSuggestion,
		...cardProps
	} = props;

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
								{ domainName }
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

			if ( isSingleFeaturedSuggestion ) {
				return (
					<HStack spacing={ 6 } className="domain-suggestion-featured__content">
						<VStack spacing={ 3 } style={ { justifyContent: 'center', height: '100%' } }>
							{ badges }
							{ domainName }
						</VStack>
						<VStack
							spacing={ 5 }
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
						{ domainName }
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
					{ domainName }
					{ price }
					{ matchReasonsList }
				</VStack>
				{ cta }
			</VStack>
		);
	};

	return (
		<Card
			{ ...cardProps }
			ref={ ref }
			className={ clsx( 'domain-suggestion-featured', className ) }
		>
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
