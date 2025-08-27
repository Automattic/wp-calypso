import { __experimentalHStack as HStack, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { lazy, Suspense } from 'react';
import { Text } from '../../components/text';
import AppsCard from './apps-card';
import JetpackAppLogo from './images/jetpack-app-logo.svg';
import type { CSSProperties } from 'react';

const QrCode = lazy( () => import( /* webpackChunkName: "async-load-qr-code" */ 'qrcode.react' ) );

export default function AppsMobileCard() {
	return (
		<AppsCard
			logo={ JetpackAppLogo }
			logoAlt={ __( 'Jetpack mobile app logo' ) }
			title={ __( 'Jetpack mobile app for WordPress' ) }
			description={ __( 'Create, design, manage, and grow your WordPress website.' ) }
		>
			<HStack spacing={ 4 }>
				<Suspense
					fallback={
						<div style={ { backgroundColor: '#CCCCCC', width: '64px', height: '64px' } } />
					}
				>
					<QrCode
						// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
						value="https://apps.wordpress.com/get?campaign=calypso-app-promo-qrcode'"
						size={ 64 }
						style={ { flexShrink: 0 } }
					/>
				</Suspense>
				<Text
					as="p"
					variant="muted"
					lineHeight="20px"
					style={ { textWrap: 'balance' } as CSSProperties }
				>
					{ createInterpolateElement(
						__(
							'Visit <link>wp.com/app</link> from your device, or scan the code to download the Jetpack mobile app.'
						),
						{
							link: (
								<ExternalLink
									// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
									href="https://apps.wordpress.com/get?campaign=calypso-app-promo-shortlink"
									children={ null }
								/>
							),
						}
					) }
				</Text>
			</HStack>
		</AppsCard>
	);
}
