import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from '../jetpack-logo';
import WooCommerceLogo from '../woocommerce-logo';
import WPCloudLogo from '../wp-cloud-logo';

import './style.scss';

export type PoweredByBrand = 'jetpack' | 'woocommerce' | 'wpcloud';
export type PoweredByVariant = 'color' | 'black' | 'white';

interface PoweredByProps {
	brand: PoweredByBrand;
	variant?: PoweredByVariant;
	className?: string;
}

const PoweredBy = ( { brand, variant = 'color', className }: PoweredByProps ) => {
	const translate = useTranslate();

	let LogoComponent;

	switch ( brand ) {
		case 'jetpack':
			LogoComponent = (
				<JetpackLogo full size={ 32 } variant={ variant } className="powered-by-logo" />
			);
			break;
		case 'woocommerce':
			LogoComponent = (
				<WooCommerceLogo className="powered-by-logo" size={ 112 } variant={ variant } />
			);
			break;
		case 'wpcloud':
			// WPCloud logo only supports black and white variants
			LogoComponent = (
				<WPCloudLogo
					className="powered-by-logo"
					size={ 156 }
					variant={ variant === 'white' ? 'white' : 'black' }
				/>
			);
			break;
	}

	return (
		<p className={ clsx( 'powered-by', className, `is-${ brand }`, `is-${ variant }` ) }>
			<span className="powered-by__text">{ translate( 'Powered by' ) }</span>
			<span className="powered-by__logo" aria-label={ translate( 'Logo' ) }>
				{ LogoComponent }
			</span>
		</p>
	);
};

export { PoweredBy };
