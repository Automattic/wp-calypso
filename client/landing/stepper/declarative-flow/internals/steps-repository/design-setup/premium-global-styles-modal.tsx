import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import './premium-global-styles-modal.scss';

interface PremiumGlobalStylesModalProps {
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	pickDesign: () => void;
}

export default function PremiumGlobalStylesModal( {
	checkout,
	closeModal,
	isOpen,
	pickDesign,
}: PremiumGlobalStylesModalProps ) {
	const translate = useTranslate();
	const premiumPlanProduct = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'value_bundle' )
	);

	//Wait until we have product data to show content
	const isLoading = ! premiumPlanProduct;

	const planName = premiumPlanProduct?.product_name;

	return (
		<Dialog
			className={ classNames( 'premium-global-styles-modal', { loading: isLoading } ) }
			isFullScreen
			isVisible={ isOpen }
			onClose={ () => closeModal() }
		>
			{ isLoading && <LoadingEllipsis /> }
			{ ! isLoading && (
				<>
					<div className="premium-global-styles-modal__col">
						<h1 className="premium-global-styles-modal__heading">
							{ translate( 'Unlock this style' ) }
						</h1>
						<p>
							{ translate(
								'Get access to all theme styles, fonts, colors, and tons of other features by upgrading to {{strong}}%s{{/strong}}.',
								{
									components: {
										strong: <strong />,
									},
									args: planName,
									comment:
										'The variable is the plan name: "...by upgrading to WordPress.com Premium."',
								}
							) }
						</p>
						<div className="premium-global-styles-modal__actions">
							<Button
								className="premium-global-styles-modal__cancel"
								onClick={ () => pickDesign() }
							>
								{ translate( 'Try it out first' ) }
							</Button>
							<Button
								className="premium-global-styles-modal__upgrade-plan"
								primary
								onClick={ () => checkout() }
							>
								{ translate( 'Upgrade plan' ) }
							</Button>
						</div>
					</div>
					<div className="premium-global-styles-modal__col">
						<div className="premium-global-styles-modal__included">
							<h2>{ translate( 'Included with your purchase' ) }</h2>
							<ul>
								<li className="premium-global-styles-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									<strong>{ translate( 'Access all theme styles' ) }</strong>
								</li>
								<li className="premium-global-styles-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									<strong>{ translate( 'Change fonts, colors, and more sitewide' ) }</strong>
								</li>
								<li className="premium-global-styles-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									{ translate( 'Unlimited customer support via email' ) }
								</li>
								<li className="premium-global-styles-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									{ translate( 'Remove WordPress.com Ads' ) }
								</li>
								<li className="premium-global-styles-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									{ translate( 'Best-in-class hosting' ) }
								</li>
							</ul>
						</div>
					</div>
					<Button
						className="premium-global-styles-modal__close"
						borderless
						onClick={ () => closeModal() }
					>
						<Gridicon icon="cross" size={ 12 } />
						<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
					</Button>
				</>
			) }
		</Dialog>
	);
}
