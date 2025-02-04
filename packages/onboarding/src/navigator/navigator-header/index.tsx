import { Button, Gridicon } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalNavigatorBackButton as NavigatorBackButton,
} from '@wordpress/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import './style.scss';

interface Props {
	title: JSX.Element;
	description?: TranslateResult;
	hideBack?: boolean;
	onBack?: () => void;
}

const NavigatorHeader = ( { title, description, hideBack, onBack }: Props ) => {
	const translate = useTranslate();

	return (
		<div className="navigator-header">
			<HStack className="navigator-header__heading" spacing={ 2 } justify="flex-start">
				{ ! hideBack && (
					<NavigatorBackButton
						as={ Button }
						title={ translate( 'Back' ) }
						borderless
						aria-label={ translate( 'Navigate to the previous view' ) }
						onClick={ onBack }
					>
						<Gridicon icon="chevron-left" size={ 16 } />
					</NavigatorBackButton>
				) }
				<h2>{ title }</h2>
			</HStack>
			{ description && <p className="navigator-header__description">{ description }</p> }
		</div>
	);
};

export default NavigatorHeader;
