import {
	Button,
	CheckboxControl,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import {
	Icon,
	chartBar,
	close,
	currencyDollar,
	external,
	globe,
	info,
	plugins,
	wordpress,
} from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import glow from '../onboarding-tour/images/tour/glow.jpg';
import { getCrossoverDestination, type CrossoverDestinationId } from './destinations';
import agenciesMark from './images/a4a.svg';
import {
	closeCrossover,
	dismissCrossover,
	openDestination,
	useCrossoverRequest,
	type CrossoverRequest,
} from './store';

import './style.scss';

const DESTINATION_ICONS: Record< CrossoverDestinationId, React.JSX.Element > = {
	'wpcom-plugins': plugins,
	'wpcom-billing': currencyDollar,
	pressable: globe,
	tipalti: currencyDollar,
};

const HINT_ICONS: Record< CrossoverDestinationId, React.JSX.Element > = {
	'wpcom-plugins': wordpress,
	'wpcom-billing': wordpress,
	pressable: chartBar,
	tipalti: info,
};

function useLeaveActions( request: CrossoverRequest ) {
	const { recordTracksEvent } = useAnalytics();
	const [ dontShowAgain, setDontShowAgain ] = useState( false );
	const properties = { destination: request.destination };

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_crossover_modal_view', properties );
		// Once per modal.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return {
		dontShowAgain,
		setDontShowAgain,
		onCancel: () => {
			recordTracksEvent( 'calypso_a4a_crossover_modal_cancel', properties );
			closeCrossover();
		},
		onContinue: () => {
			recordTracksEvent( 'calypso_a4a_crossover_modal_continue', {
				...properties,
				dont_show_again: dontShowAgain,
			} );
			if ( dontShowAgain ) {
				dismissCrossover( request.destination );
			}
			openDestination( request );
		},
	};
}

function DontShowAgain( {
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: ( value: boolean ) => void;
} ) {
	return (
		<CheckboxControl
			__nextHasNoMarginBottom
			label={ __( 'Don’t show this again' ) }
			checked={ checked }
			onChange={ onChange }
		/>
	);
}

// The ↗ matches the sidebar's external links (`SidebarMenuItem`).
function ContinueButton( { product, onClick }: { product: string; onClick: () => void } ) {
	return (
		<Button __next40pxDefaultSize variant="primary" onClick={ onClick }>
			<HStack justify="flex-start" spacing={ 1 } expanded={ false }>
				<span>
					{
						/* translators: %s is a product, e.g. WordPress.com or Pressable */
						sprintf( __( 'Continue to %s' ), product )
					}
				</span>
				<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
			</HStack>
		</Button>
	);
}

// From the agency's ring over to the destination's, above the marks' middle,
// landing like a Mac installer's drag arrow. The dots are the curve
// M6 28 Q36 -12 82 26 cut 9px short of the head, so the last dot keeps a
// dot's gap from it; the head's arms follow the curve's end tangent.
function CrossoverArc() {
	return (
		<svg className="a4a-crossover-arc" viewBox="0 0 88 72" aria-hidden="true">
			<path className="a4a-crossover-arc-line" d="M6 28 Q33.6 -8.9 74.9 20.5" pathLength={ 100 } />
			<path className="a4a-crossover-arc-head" d="M80.9 21.1 L82 26 L77 25.9" />
		</svg>
	);
}

/**
 * The handoff: the two products side by side on the tour's field, then what
 * the agency does there, that this tab stays, and how to tell where they are
 * once they arrive.
 */
function CrossoverModal( { request }: { request: CrossoverRequest } ) {
	const destination = getCrossoverDestination( request.destination );
	const headingId = `a4a-crossover-heading-${ useInstanceId( CrossoverModal ) }`;
	const { dontShowAgain, setDontShowAgain, onCancel, onContinue } = useLeaveActions( request );

	const rows = [
		{
			icon: external,
			text: __( 'It opens in a new tab. This tab stays on Automattic for Agencies.' ),
		},
		{ icon: HINT_ICONS[ request.destination ], text: destination.hint },
		{ icon: DESTINATION_ICONS[ request.destination ], text: destination.description },
	];

	return (
		<Modal
			className="a4a-crossover-modal"
			aria={ { labelledby: headingId } }
			onRequestClose={ onCancel }
			__experimentalHideHeader
		>
			<div className="a4a-crossover-handoff">
				<div className="a4a-crossover-close">
					<Button icon={ close } label={ __( 'Close' ) } onClick={ onCancel } />
				</div>
				<div className="a4a-crossover-field" style={ { backgroundImage: `url(${ glow })` } }>
					<HStack spacing={ 0 } justify="center" alignment="top" expanded={ false }>
						<VStack className="a4a-crossover-product" spacing={ 3 } alignment="center">
							<div className="a4a-crossover-ring">
								<img className="a4a-crossover-mark is-agencies" src={ agenciesMark } alt="" />
							</div>
							<Text size={ 12 } lineHeight="16px">
								{ __( 'Automattic for Agencies' ) }
							</Text>
						</VStack>
						<CrossoverArc />
						<VStack className="a4a-crossover-product" spacing={ 3 } alignment="center">
							<div className="a4a-crossover-ring">
								<img
									className={ clsx( 'a4a-crossover-mark', {
										'is-wordmark': request.destination === 'tipalti',
									} ) }
									src={ destination.mark }
									alt=""
								/>
							</div>
							<Text size={ 12 } lineHeight="16px">
								{ destination.product }
							</Text>
						</VStack>
					</HStack>
				</div>
				<VStack className="a4a-crossover-content" spacing={ 6 }>
					<Heading id={ headingId } level={ 2 } size={ 20 } weight={ 500 } lineHeight="28px">
						{ destination.title }
					</Heading>
					<VStack as="ul" spacing={ 4 } className="a4a-crossover-rows">
						{ rows.map( ( row ) => (
							<HStack as="li" key={ row.text } spacing={ 3 } alignment="top" justify="flex-start">
								<Icon icon={ row.icon } size={ 24 } className="a4a-crossover-row-icon" />
								<Text>{ row.text }</Text>
							</HStack>
						) ) }
					</VStack>
				</VStack>
				<HStack className="a4a-crossover-actions" justify="space-between" wrap>
					<DontShowAgain checked={ dontShowAgain } onChange={ setDontShowAgain } />
					<ButtonStack justify="flex-end" expanded={ false }>
						<Button __next40pxDefaultSize variant="tertiary" onClick={ onCancel }>
							{ __( 'Cancel' ) }
						</Button>
						<ContinueButton product={ destination.product } onClick={ onContinue } />
					</ButtonStack>
				</HStack>
			</div>
		</Modal>
	);
}

/**
 * Renders the modal for whichever link asked to leave the dashboard. Mounted
 * once, in the agency layout; the links call `leaveDashboard` from anywhere,
 * the sidebar included.
 */
export default function CrossoverModalHost() {
	const request = useCrossoverRequest();
	if ( ! request ) {
		return null;
	}
	return <CrossoverModal key={ request.destination } request={ request } />;
}
