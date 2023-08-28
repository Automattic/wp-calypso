import { Button, Gridicon, PremiumBadge } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useGlobalStylesUpgradeTranslations from 'calypso/components/premium-global-styles-upgrade-modal/use-global-styles-upgrade-translations';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import './screen-upsell.scss';

interface Props {
	resetCustomStyles: boolean;
	globalStylesInPersonalPlan?: boolean;
	numOfSelectedGlobalStyles?: number;
	setResetCustomStyles: ( value: boolean ) => void;
	onCheckout: () => void;
	onTryStyle: () => void;
	onContinue: () => void;
}

const ScreenUpsell = ( {
	resetCustomStyles,
	globalStylesInPersonalPlan,
	numOfSelectedGlobalStyles = 1,
	setResetCustomStyles,
	onCheckout,
	onTryStyle,
	onContinue,
}: Props ) => {
	const translate = useTranslate();
	const { title } = useScreen( 'upsell' );
	const translations = useGlobalStylesUpgradeTranslations( {
		globalStylesInPersonalPlan,
		numOfSelectedGlobalStyles,
	} );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ translate( "You've chosen a custom style and action is required." ) }
				hideBack
			/>
			<div className="screen-container__body">
				<strong className="screen-upsell__heading">
					{ translate( 'Custom styles' ) }
					<PremiumBadge
						shouldHideTooltip
						shouldCompactWithAnimation
						labelText={ translate( 'Upgrade' ) }
					/>
				</strong>
				<div className="screen-upsell__description">
					<p>{ translations.description }</p>
					<ToggleControl
						label={ translate( 'Reset custom styles' ) }
						checked={ resetCustomStyles }
						onChange={ () => setResetCustomStyles( ! resetCustomStyles ) }
					/>
				</div>
				<strong>{ translations.featuresTitle }</strong>
				<ul className="screen-upsell__features">
					{ translations.features.map( ( feature, i ) => (
						<li key={ i }>
							<Gridicon icon="checkmark" size={ 16 } />
							{ feature }
						</li>
					) ) }
				</ul>
			</div>
			<div className="screen-container__footer">
				{ ! resetCustomStyles && (
					<Button className="pattern-assembler__button" onClick={ onTryStyle }>
						{ translations.cancel }
					</Button>
				) }
				<Button
					className="pattern-assembler__button"
					primary
					onClick={ ! resetCustomStyles ? onCheckout : onContinue }
				>
					{ ! resetCustomStyles ? translations.upgradeWithPlan : translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenUpsell;
