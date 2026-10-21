import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import type { ReactNode } from 'react';

interface Props {
	/** What is selected, e.g. "3 WordPress.com sites" or the plan name. */
	label: ReactNode;
	price: ReactNode;
	/** Supporting lines under the price. */
	notes?: ReactNode;
	action: ReactNode;
	footnote?: ReactNode;
	/** The reassurance line under the divider, e.g. "Cancel anytime." */
	assurance?: ReactNode;
	/** The monthly price on its own, for the buy bar on phones. */
	compactPrice?: string;
}

/**
 * The purchase rail: what is selected, what it costs, and the call to action.
 * On phones the rail comes after the steps, so a bar at the bottom of the
 * screen carries the same action until the card scrolls into view.
 */
export default function SelectedPlanCard( {
	label,
	price,
	notes,
	action,
	footnote,
	assurance,
	compactPrice,
}: Props ) {
	const isSmallScreen = useViewportMatch( 'small', '<' );
	const cardRef = useRef< HTMLDivElement >( null );
	const [ isCardInView, setIsCardInView ] = useState( false );

	useEffect( () => {
		if ( ! isSmallScreen || ! cardRef.current ) {
			return;
		}
		const observer = new IntersectionObserver( ( [ entry ] ) =>
			setIsCardInView( entry.isIntersecting )
		);
		observer.observe( cardRef.current );
		return () => observer.disconnect();
	}, [ isSmallScreen ] );

	return (
		<>
			{ isSmallScreen &&
				! isCardInView &&
				createPortal(
					<HStack spacing={ 3 } wrap className="dashboard-marketplace-hosting__buy-bar">
						<VStack spacing={ 0 } className="dashboard-marketplace-hosting__buy-bar-text">
							<Text weight={ 600 } truncate>
								{ label }
							</Text>
							{ compactPrice && (
								<Text variant="muted" truncate>
									{ sprintf(
										/* translators: %s is a monthly price, e.g. "US$20.83". */
										__( '%s/month' ),
										compactPrice
									) }
								</Text>
							) }
						</VStack>
						{ action }
					</HStack>,
					document.body
				) }
			<Card ref={ cardRef }>
				<CardHeader>
					<SectionHeader level={ 3 } title={ __( 'Currently selected' ) } />
				</CardHeader>
				<CardBody>
					<VStack spacing={ 4 } alignment="stretch">
						<VStack spacing={ 2 }>
							<Text>{ label }</Text>
							{ price }
							{ notes }
						</VStack>
						{ action }
						{ footnote }
						{ assurance && (
							<>
								<CardDivider />
								<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
									<Icon icon={ check } className="dashboard-marketplace-hosting__rail-check" />
									<Text variant="muted">{ assurance }</Text>
								</HStack>
							</>
						) }
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
