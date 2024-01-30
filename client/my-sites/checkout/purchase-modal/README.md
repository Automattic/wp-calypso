# PurchaseModal

The `PurchaseModal` component is a React component designed to render a 1-click checkout modal. This modal provides a seamless and quick purchasing experience for eligible users, as determined by the result of the `useIsEligibleForOneClickCheckout` hook.

## Props

- **siteSlug** (String, required): The slug of the site where the modal is rendered.
- **productToAdd** (MinimalRequestCartProduct, required): The product object. Ensure that the object reference does not change.
- **showFeatureList** (Boolean, required): Whether to display a feature list in the modal. Default is `false`.
- **disabledThankYouPage** (Boolean, optional): Whether to disable the thank-you page after a successful purchase. Default is `false`.
- **onPurchaseSuccess** (Function, optional): Callback function to be called when the purchase is successful.
- **onClose** (Function, required): Callback function to be called when the modal is closed.

Note: If `disabledThankYouPage` is `true`, then `onPurchaseSuccess` should also be defined, otherwise the modal will remain open after the purchase is complete. This rule is only enforced via Typescript.

## Example

```jsx
const YourComponent = () => {

	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showPurchaseModal, setShowPurchaseModal ] = useState( false );
	const { isLoading, result: isEligibleForOneClickCheckout } = useIsEligibleForOneClickCheckout();

	const handleOnUpgradeClick = () => {
		// If eligible for 1-click checkout, show the modal
		if ( true === isEligibleForOneClickCheckout ) {
			setShowPurchaseModal( true );
			return;
		}
		// Else redirect to the checkout page
		page( `/checkout/${ props.siteSlug }/business` );
	}

	const handleClose = () => {
		// Your logic to handle modal close
		setShowPurchaseModal( false );
	};

	const handlePurchaseSuccess = () => {
		// Your logic to handle a successful purchase
		setShowPurchaseModal( false );
		dispatch(
			successNotice( translate( 'Your purchase has been completed!' ), {
				id: 'plugins-purchase-modal-success',
			} )
		);
	};

	const businessPlanProduct = useMemo( () =>
		createRequestCartProduct( {
			product_slug: PLAN_BUSINESS,
		} )
	);

	return (
		{ showPurchaseModal && (
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ getStripeConfiguration }
					locale={ translate.localeSlug }
				>
					<PurchaseModal
						productToAdd={ businessPlanProduct }
						onClose={ handleClose }
						onPurchaseSuccess={ handlePurchaseSuccess }
						disabledThankYouPage={ true }
						showFeatureList={ true }
						siteSlug={ props.siteSlug }
					/>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		) }
		<Button busy={ isLoading } onClick={ handleOnUpgradeClick }>Upgrade to Business</Button>
	);
};
```