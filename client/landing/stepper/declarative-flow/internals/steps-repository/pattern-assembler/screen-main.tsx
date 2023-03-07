import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { header, footer, layout, styles, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { NavigationButtonAsItem } from './navigator-buttons';
import NavigatorHeader from './navigator-header';

interface Props {
	shouldUnlockGlobalStyles: boolean;
	onSelect: ( name: string ) => void;
	onContinueClick: () => void;
}

const ScreenMain = ( { shouldUnlockGlobalStyles, onSelect, onContinueClick }: Props ) => {
	const translate = useTranslate();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Let’s get creative' ) }
				description={ translate(
					'Use our library of styles and patterns to design your own homepage.'
				) }
				hideBack
			/>
			<div className="screen-container__body">
				<ItemGroup>
					<NavigationButtonAsItem
						path="/header"
						icon={ header }
						aria-label={ translate( 'Choose a header' ) }
						onClick={ () => onSelect( 'header' ) }
					>
						<span className="pattern-layout__list-item-text">
							{ translate( 'Choose a header' ) }
						</span>
					</NavigationButtonAsItem>
					<Divider />
					<NavigationButtonAsItem
						path="/footer"
						icon={ footer }
						aria-label={ translate( 'Choose a footer' ) }
						onClick={ () => onSelect( 'footer' ) }
					>
						<span className="pattern-layout__list-item-text">
							{ translate( 'Choose a footer' ) }
						</span>
					</NavigationButtonAsItem>
					<Divider />
					<NavigationButtonAsItem
						path="/homepage"
						icon={ layout }
						aria-label={ translate( 'Create your homepage' ) }
						onClick={ () => onSelect( 'homepage' ) }
					>
						<span className="pattern-layout__list-item-text">
							{ translate( 'Create your homepage' ) }
						</span>
					</NavigationButtonAsItem>
					{ isEnabled( 'pattern-assembler/color-and-fonts' ) && (
						<>
							<Divider />
							<NavigationButtonAsItem
								path="/color-palettes"
								icon={ styles }
								aria-label={ translate( 'Change colors' ) }
								onClick={ () => onSelect( 'color-palettes' ) }
							>
								<span className="pattern-layout__list-item-text">
									{ translate( 'Change colors' ) }
								</span>
							</NavigationButtonAsItem>
							<Divider />
							<NavigationButtonAsItem
								path="/font-pairings"
								icon={ typography }
								aria-label={ translate( 'Change fonts' ) }
								onClick={ () => onSelect( 'font-pairings' ) }
							>
								<span className="pattern-layout__list-item-text">
									{ translate( 'Change fonts' ) }
								</span>
							</NavigationButtonAsItem>
						</>
					) }
				</ItemGroup>
			</div>
			<div className="screen-container__footer">
				<span className="screen-container__description">
					{ shouldUnlockGlobalStyles
						? translate( 'You’ve selected Premium fonts or colors for your site' )
						: translate(
								'Open the editor where you can further customize your homepage as desired'
						  ) }
				</span>
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ shouldUnlockGlobalStyles ? translate( 'Unlock this style' ) : translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
