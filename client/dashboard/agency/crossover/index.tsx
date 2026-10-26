import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, close, external } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import NewTabLabel from '../components/new-tab-label';
import glow from '../onboarding-tour/images/tour/glow.jpg';
import { getCrossoverDestination } from './destinations';
import agenciesMark from './images/a4a.svg';
import {
	CROSSOVER_DISMISSED_PREFERENCE,
	closeCrossover,
	openDestination,
	useCrossoverRequest,
	type CrossoverRequest,
} from './store';

import './style.scss';

// A dotted arc from the agency's ring to the destination's, ending in an arrowhead along the
// curve's end tangent. 16 even gaps over the normalized length put a dot on each end.
function CrossoverArc() {
	return (
		<svg className="a4a-crossover-arc" viewBox="0 0 88 72" aria-hidden="true">
			<path className="a4a-crossover-arc-line" d="M6 28 Q33.6 -8.9 74.9 20.5" pathLength={ 100 } />
			<path className="a4a-crossover-arc-head" d="M80.9 21.1 L82 26 L77 25.9" />
		</svg>
	);
}

function ProductMark( { src }: { src: string } ) {
	return (
		<HStack className="a4a-crossover-ring" justify="center" alignment="center" expanded={ false }>
			<img className="a4a-crossover-mark" src={ src } alt="" />
		</HStack>
	);
}

function CrossoverModal( { request }: { request: CrossoverRequest } ) {
	const destination = getCrossoverDestination( request.destination );
	const { recordTracksEvent } = useAnalytics();
	const [ dontShowAgain, setDontShowAgain ] = useState( false );
	const { data: dismissed } = useQuery( userPreferenceQuery( CROSSOVER_DISMISSED_PREFERENCE ) );
	const { mutate: saveDismissed } = useMutation(
		userPreferenceOptimisticMutation( CROSSOVER_DISMISSED_PREFERENCE )
	);

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_crossover_modal_view', {
			destination: request.destination,
		} );
	}, [ request.destination, recordTracksEvent ] );

	const onCancel = () => {
		recordTracksEvent( 'calypso_a4a_crossover_modal_cancel', {
			destination: request.destination,
		} );
		closeCrossover();
	};

	const onContinue = () => {
		recordTracksEvent( 'calypso_a4a_crossover_modal_continue', {
			destination: request.destination,
			dont_show_again: dontShowAgain,
		} );
		if ( dontShowAgain ) {
			saveDismissed( [ ...new Set( [ ...( dismissed ?? [] ), request.destination ] ) ] );
		}
		openDestination( request );
	};

	const rows = [
		{
			icon: external,
			text: __( 'It opens in a new tab. This tab stays on Automattic for Agencies.' ),
		},
		{ icon: destination.hintIcon, text: destination.hint },
		{ icon: destination.descriptionIcon, text: destination.description },
	];

	return (
		<Modal
			// The header is hidden, so the dialog takes its name from here.
			contentLabel={ destination.title }
			onRequestClose={ onCancel }
			__experimentalHideHeader
		>
			<div className="a4a-crossover">
				<div className="a4a-crossover-close">
					<Button
						__next40pxDefaultSize
						icon={ close }
						label={ __( 'Close' ) }
						onClick={ onCancel }
					/>
				</div>
				<HStack
					className="a4a-crossover-field"
					style={ { backgroundImage: `url(${ glow })` } }
					spacing={ 0 }
					justify="center"
					alignment="top"
				>
					<VStack className="a4a-crossover-product" spacing={ 3 } alignment="center">
						<ProductMark src={ agenciesMark } />
						<Text size={ 12 } lineHeight="16px">
							{ __( 'Automattic for Agencies' ) }
						</Text>
					</VStack>
					<CrossoverArc />
					<VStack className="a4a-crossover-product" spacing={ 3 } alignment="center">
						<ProductMark src={ destination.mark } />
						<Text size={ 12 } lineHeight="16px">
							{ destination.product }
						</Text>
					</VStack>
				</HStack>
				<VStack className="a4a-crossover-content" spacing={ 6 }>
					<Heading level={ 2 } size={ 20 } weight={ 500 } lineHeight="28px">
						{ destination.title }
					</Heading>
					<VStack as="ul" spacing={ 4 } className="a4a-crossover-rows">
						{ rows.map( ( row ) => (
							<HStack as="li" key={ row.text } spacing={ 3 } alignment="top" justify="flex-start">
								<Icon className="a4a-crossover-row-icon" icon={ row.icon } size={ 24 } />
								<Text>{ row.text }</Text>
							</HStack>
						) ) }
					</VStack>
				</VStack>
				<HStack className="a4a-crossover-actions" justify="space-between" wrap>
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ __( 'Don’t show this again' ) }
						checked={ dontShowAgain }
						onChange={ setDontShowAgain }
					/>
					<ButtonStack justify="flex-end" expanded={ false }>
						<Button __next40pxDefaultSize variant="tertiary" onClick={ onCancel }>
							{ __( 'Cancel' ) }
						</Button>
						<Button __next40pxDefaultSize variant="primary" onClick={ onContinue }>
							<NewTabLabel>
								{
									/* translators: %s is a product name, e.g. WordPress.com or Pressable. */
									sprintf( __( 'Continue to %s' ), destination.product )
								}
							</NewTabLabel>
						</Button>
					</ButtonStack>
				</HStack>
			</div>
		</Modal>
	);
}

/**
 * Shows the crossover modal for whichever link asked to leave the agency dashboard through
 * `leaveDashboard`. Mounted once, in the agency layout.
 */
export default function CrossoverModalHost() {
	const request = useCrossoverRequest();
	// Loads the preferences `leaveDashboard` reads within the click.
	useQuery( userPreferenceQuery( CROSSOVER_DISMISSED_PREFERENCE ) );

	if ( ! request ) {
		return null;
	}
	return <CrossoverModal key={ request.destination } request={ request } />;
}
