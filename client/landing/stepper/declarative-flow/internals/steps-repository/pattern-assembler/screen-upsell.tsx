import { Button, Gridicon, PremiumBadge } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import useGlobalStylesUpgradeTranslations from 'calypso/components/premium-global-styles-upgrade-modal/use-global-styles-upgrade-translations';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';
import './screen-upsell.scss';

interface Props {
	resetCustomStyles: boolean;
	globalStylesInPersonalPlan?: boolean;
	numOfSelectedGlobalStyles?: number;
	setResetCustomStyles: React.Dispatch< React.SetStateAction< boolean > >;
	onCheckout: () => void;
	onTryStyle: () => void;
	onContinue: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenUpsell = ( {
	resetCustomStyles,
	globalStylesInPersonalPlan,
	numOfSelectedGlobalStyles = 1,
	setResetCustomStyles,
	onCheckout,
	onTryStyle,
	onContinue,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const translations = useGlobalStylesUpgradeTranslations( {
		globalStylesInPersonalPlan,
		numOfSelectedGlobalStyles,
	} );

	const handleBackClick = () => {
		setResetCustomStyles( false );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_BACK_CLICK, {
			screen_from: 'upsell',
			screen_to: 'styles',
		} );
	};

	return (
		<>
			<QueryProductsList />
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Custom styles' ) } /> }
				description={ translate( "You've chosen a custom style and action is required." ) }
				onBack={ handleBackClick }
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
						onChange={ () => setResetCustomStyles( ( value ) => ! value ) }
					/>
				</div>
				<strong>{ translations.featuresTitle }</strong>
				<ul className="screen-upsell__features">
					{ translations.features.map( ( feature: JSX.Element, i: number ) => (
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
					{ ! resetCustomStyles ? translations.upgradeWithPlan : translate( 'Edit your content' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenUpsell;
