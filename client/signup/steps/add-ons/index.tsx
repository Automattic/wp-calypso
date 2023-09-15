import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import AddOnsGrid from 'calypso/my-sites/add-ons/components/add-ons-grid';
import useAddOns from 'calypso/my-sites/add-ons/hooks/use-add-ons';
import NavigationLink from 'calypso/signup/navigation-link';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch } from 'calypso/state';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import type { AddOnMeta } from '@automattic/data-stores';

import './styles.scss';

interface Props {
	stepSectionName: string | null;
	stepName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	flowName: string;
	positionInFlow: number;
	defaultDependencies: object;
	forwardUrl: string;
}
interface AddOnsProps {
	selectedAddOns: string[];
	addOns: ( AddOnMeta | null )[];
	onToggleAllAddOns: () => void;
	onAddAddOn: ( addOnSlug: string ) => void;
	onRemoveAddOn: ( addOnSlug: string ) => void;
}

const ToggleButton = styled.button`
	display: inline-block;
	margin: 1.5rem 0;
	cursor: pointer;
	text-decoration: underline;
	font-size: 1rem;
	font-weight: 500;
`;

const AddOnsContainer = styled.div`
	padding: 0 20px 20px;
`;

const AddOns = ( {
	onToggleAllAddOns,
	onAddAddOn,
	onRemoveAddOn,
	selectedAddOns,
	addOns,
}: AddOnsProps ) => {
	const translate = useTranslate();

	const getAddOnSelectedStatus = useCallback(
		( { productSlug }: AddOnMeta ) => {
			const available = ! selectedAddOns.find( ( product: string ) => product === productSlug );
			return {
				available,
				text: translate( 'Added to your plan' ),
			};
		},
		[ selectedAddOns, translate ]
	);

	const toggleText = ! selectedAddOns.length
		? '+ ' + translate( 'Select all add-ons' )
		: '- ' + translate( 'Remove all add-ons' );

	return (
		<AddOnsContainer>
			<ToggleButton onClick={ onToggleAllAddOns }>{ toggleText }</ToggleButton>
			<AddOnsGrid
				actionPrimary={ { text: translate( 'Add to my plan' ), handler: onAddAddOn } }
				actionSecondary={ {
					text: translate( 'Remove add-on' ),
					handler: onRemoveAddOn,
				} }
				useAddOnAvailabilityStatus={ getAddOnSelectedStatus }
				addOns={ addOns }
				highlightFeatured={ true }
			/>
		</AddOnsContainer>
	);
};

export default function AddOnsStep( props: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const addOns = useAddOns();

	const [ selectedAddOns, setSelectedAddOns ] = useState< string[] >( [] );

	const onAddAddOn = useCallback(
		( addOnSlug: string ) => {
			setSelectedAddOns( [ ...selectedAddOns, addOnSlug ] );
		},
		[ selectedAddOns ]
	);

	const onRemoveAddOn = useCallback(
		( addOnSlug: string ) => {
			setSelectedAddOns( selectedAddOns.filter( ( addOn ) => addOn !== addOnSlug ) );
		},
		[ selectedAddOns ]
	);

	const onToggleAllAddOns = useCallback( () => {
		if ( selectedAddOns.length > 0 ) {
			setSelectedAddOns( [] );
		} else {
			setSelectedAddOns(
				addOns
					.filter( ( addOn ) => null !== addOn )
					.map( ( addOn ) => ( addOn as AddOnMeta ).productSlug )
			);
		}
	}, [ addOns, selectedAddOns ] );

	const headerText = translate( 'Boost your plan with add-ons' );
	const subHeaderText = translate(
		"Expand what's possible with your free WordPress.com site, one feature at a time. The cost of these add-ons can be applied towards a paid plan when you're ready to upgrade."
	);
	const continueText = selectedAddOns.length
		? translate( 'Go to checkout' )
		: translate( 'Continue' );

	const submitAddOns = useCallback( () => {
		// We need to send out undefined to avoid checking out an empty cart.
		const addOnProducts: MinimalRequestCartProduct[] | undefined = selectedAddOns.length
			? selectedAddOns.map( ( addOnSlug ) => ( {
					product_slug: addOnSlug,
			  } ) )
			: undefined;

		const step = {
			stepName: props.stepName,
			stepSectionName: props.stepSectionName,
			cartItem: addOnProducts,
		};

		setTimeout( () => {
			dispatch(
				submitSignupStep( step, {
					cartItem: addOnProducts,
				} )
			);
		}, 10 );
	}, [ dispatch, props.stepName, props.stepSectionName, selectedAddOns ] );

	return (
		<StepWrapper
			{ ...props }
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<AddOns
					onToggleAllAddOns={ onToggleAllAddOns }
					onAddAddOn={ onAddAddOn }
					onRemoveAddOn={ onRemoveAddOn }
					selectedAddOns={ selectedAddOns }
					addOns={ addOns }
				/>
			}
			hideSkip
			headerButton={
				<NavigationLink
					direction="forward"
					labelText={ continueText }
					forwardIcon={ null }
					primary={ false }
					borderless={ false }
					{ ...props }
					goToNextStep={ submitAddOns }
				/>
			}
		/>
	);
}
