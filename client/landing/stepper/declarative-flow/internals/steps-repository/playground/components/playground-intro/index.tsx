import { __experimentalHeading as Heading, ProgressBar } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { WooTopBarLogo } from 'calypso/landing/stepper/declarative-flow/internals/components/woo-top-bar-logo';
import { cloud, rocket, tools } from './icons';
import type { PlaygroundBootProgress } from '../../lib/boot-progress';

import './style.scss';

export function PlaygroundIntro( { progress }: { progress: PlaygroundBootProgress } ) {
	const { __ } = useI18n();

	const captions = {
		wordpress: __( 'Downloading WordPress' ),
		woocommerce: __( 'Downloading WooCommerce' ),
		store: __( 'Setting up your store' ),
	};

	const points = [
		{
			icon: tools,
			text: __( 'Add and configure products, set up payments, customize your store design.' ),
		},
		{
			icon: cloud,
			text: __( 'Save your store whenever you’re ready. This creates a safe home for your work.' ),
		},
		{
			icon: rocket,
			text: __( 'Ready to go live whenever you decide. Or save and return later. No rush.' ),
		},
	];

	return (
		<div className="playground-intro">
			<div className="playground-intro__logo" aria-hidden="true">
				<WooTopBarLogo />
			</div>
			<div className="playground-intro__content">
				<div className="playground-intro__header">
					<Heading
						level={ 1 }
						className="playground-intro__title"
						size={ 36 }
						weight={ 700 }
						lineHeight={ 1.1 }
						align="center"
					>
						{ __( 'Build first, choose hosting later' ) }
					</Heading>
					<p className="playground-intro__subtitle">
						{ __(
							'Your store is loading. What you build here is real—the exact dashboard you’ll use when you go live.'
						) }
					</p>
				</div>
				<ul className="playground-intro__points">
					{ points.map( ( { icon, text } ) => (
						<li key={ text } className="playground-intro__point">
							<Icon icon={ icon } size={ 32 } className="playground-intro__point-icon" />
							<span>{ text }</span>
						</li>
					) ) }
				</ul>
				<div className="playground-intro__progress">
					<p className="playground-intro__caption" role="status">
						{ captions[ progress.stage ] }
					</p>
					<ProgressBar
						className="playground-intro__progress-bar"
						value={ progress.value }
						aria-label={ __( 'Store loading progress' ) }
					/>
				</div>
			</div>
		</div>
	);
}
