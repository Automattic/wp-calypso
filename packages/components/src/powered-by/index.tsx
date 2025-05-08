import './style.scss';

import colorStudio from '@automattic/color-studio';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import React from 'react';
import { JetpackLogo } from '../logos/jetpack-logo';
import { WooLogo } from '../logos/woo-logo';
import WordPressWordmark from '../wordpress-wordmark';

const PALETTE = colorStudio.colors;
const COLOR_WPCOM_BLUE = PALETTE[ 'Blue 50' ];
const COLOR_WHITE = PALETTE[ 'White' ];
const COLOR_BLACK = PALETTE[ 'Black' ];

export type PoweredByBrand = 'jetpack' | 'woocommerce' | 'wpcom';
export type PoweredByVariant = 'color' | 'black' | 'white';

interface PoweredByProps {
	brand: PoweredByBrand;
	colorVariant?: PoweredByVariant;
	className?: string;
}

const getBrandName = ( brand: PoweredByBrand ) => {
	switch ( brand ) {
		case 'jetpack':
			return 'Jetpack';
		case 'woocommerce':
			return 'WooCommerce';
		case 'wpcom':
			return 'WordPress.com';
	}
};

const getWordPressWordmarkColor = ( colorVariant: PoweredByVariant ) => {
	switch ( colorVariant ) {
		case 'white':
			return COLOR_WHITE;
		case 'black':
			return COLOR_BLACK;
		default:
			return COLOR_WPCOM_BLUE;
	}
};

const PoweredBy = ( { brand, colorVariant = 'color', className }: PoweredByProps ) => {
	let LogoComponent: React.ReactNode = null;

	switch ( brand ) {
		case 'jetpack':
			LogoComponent = <JetpackLogo colorVariant={ colorVariant } size={ 25 } full />;
			break;
		case 'woocommerce':
			LogoComponent = <WooLogo colorVariant={ colorVariant } height={ 25 } width={ 66 } />;
			break;
		case 'wpcom':
			LogoComponent = (
				<WordPressWordmark
					color={ getWordPressWordmarkColor( colorVariant ) }
					size={ { height: 25, width: 'auto' } }
				/>
			);
			break;
	}

	return (
		<p className={ clsx( 'powered-by', className, `is-${ brand }`, `is-${ colorVariant }` ) }>
			{ createInterpolateElement( __( '<text>Powered by</text> <logo/>', 'calypso' ), {
				text: <span className="powered-by__text" />,
				logo: (
					<span className="powered-by__logo" aria-label={ getBrandName( brand ) }>
						{ LogoComponent }
					</span>
				),
			} ) }
		</p>
	);
};

export { PoweredBy };
